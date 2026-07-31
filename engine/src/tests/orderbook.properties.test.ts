import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Fill, Order, Orderbook } from "../trade/Orderbook";
import {
    BookState,
    Violation,
    conservationOfQuantity,
    depthMatchesRestingQuantity,
    filledNeverExceedsQuantity,
    fillsRespectBestPrice,
    fillsSumToExecutedQty,
    noBetterPriceLeftBehind,
    noCrossedBook,
    noSelfTrade,
    noZombieOrders,
    snapshotBook,
    timePriorityAtSamePrice,
} from "./invariants";

/**
 * Property-based tests for the matching engine.
 *
 * Rather than asserting on hand-picked examples, these generate thousands of
 * random order streams and assert that the invariants in ./invariants.ts hold
 * after EVERY operation. When one fails, fast-check shrinks the input to a
 * minimal reproducing sequence and prints the seed for exact replay.
 *
 * See ../../BUGS.md for what this suite found on first run.
 */

interface GeneratedOrder {
    side: "buy" | "sell";
    price: number;
    quantity: number;
    userId: string;
}

type Checker = (ctx: {
    before: BookState;
    book: Orderbook;
    taker: Order;
    fills: Fill[];
    executedQty: number;
    seqOf: Map<string, number>;
}) => Violation;

/**
 * Prices are drawn from a deliberately narrow band so that orders cross
 * frequently — a wide range would mostly produce a book that never matches,
 * which exercises nothing. Quantities are integers so that any failure is
 * unambiguously a logic bug rather than floating-point noise; decimals get
 * their own dedicated property at the bottom of this file.
 */
const orderArb: fc.Arbitrary<GeneratedOrder> = fc.record({
    side: fc.constantFrom<"buy" | "sell">("buy", "sell"),
    price: fc.integer({ min: 98, max: 102 }),
    quantity: fc.integer({ min: 1, max: 10 }),
    userId: fc.constantFrom("u1", "u2", "u3"),
});

const streamArb = fc.array(orderArb, { minLength: 1, maxLength: 25 });

/** Replays a generated stream through a fresh book, checking after each step. */
function firstViolation(stream: GeneratedOrder[], check: Checker): string | null {
    const book = new Orderbook("SOL", [], [], 0, 0);
    const seqOf = new Map<string, number>();

    for (let i = 0; i < stream.length; i++) {
        const g = stream[i];
        const taker: Order = { ...g, orderId: `o${i}`, filled: 0 };
        seqOf.set(taker.orderId, i);

        const before = snapshotBook(book);
        const { fills, executedQty } = book.addOrder(taker);

        const violation = check({ before, book, taker, fills, executedQty, seqOf });
        if (violation) {
            const history = stream
                .slice(0, i + 1)
                .map((o, n) => `  #${n} ${o.side.padEnd(4)} ${o.quantity} @ ${o.price} (${o.userId})`)
                .join("\n");
            return `${violation}\n\nMinimal reproducing sequence:\n${history}`;
        }
    }
    return null;
}

/**
 * Set FC_SEED to replay an exact run — every counterexample recorded in
 * BUGS.md was produced with `FC_SEED=42 npm test`.
 */
const SEED = process.env.FC_SEED ? Number(process.env.FC_SEED) : undefined;

/** Asserts an invariant holds across many random streams. */
function assertInvariant(name: string, check: Checker, numRuns = 500) {
    fc.assert(
        fc.property(streamArb, (stream) => {
            const violation = firstViolation(stream, check);
            if (violation) throw new Error(`[${name}]\n${violation}`);
        }),
        { numRuns, seed: SEED }
    );
}

describe("Orderbook invariants (property-based)", () => {
    it("never fills an order beyond the quantity it was placed for", () => {
        assertInvariant("filledNeverExceedsQuantity", ({ book }) => filledNeverExceedsQuantity(book));
    });

    it("never leaves a fully-consumed order resting in the book", () => {
        assertInvariant("noZombieOrders", ({ book }) => noZombieOrders(book));
    });

    it("never leaves the book in a crossed state", () => {
        assertInvariant("noCrossedBook", ({ book }) => noCrossedBook(book));
    });

    it("publishes depth that matches the quantity actually available", () => {
        assertInvariant("depthMatchesRestingQuantity", ({ book }) => depthMatchesRestingQuantity(book));
    });

    it("reports fills that sum to the executed quantity", () => {
        assertInvariant("fillsSumToExecutedQty", ({ fills, executedQty }) =>
            fillsSumToExecutedQty(fills, executedQty)
        );
    });

    it("conserves quantity — the contra side shrinks by exactly what was executed", () => {
        assertInvariant("conservationOfQuantity", ({ before, book, taker, executedQty }) =>
            conservationOfQuantity(before, book, taker, executedQty)
        );
    });

    it("fills a taker at the best available price first", () => {
        assertInvariant("fillsRespectBestPrice", ({ before, taker, fills }) =>
            fillsRespectBestPrice(before, taker, fills)
        );
    });

    it("never skips over a better-priced resting order", () => {
        assertInvariant("noBetterPriceLeftBehind", ({ book, taker, fills }) =>
            noBetterPriceLeftBehind(book, taker, fills)
        );
    });

    it("honours time priority among orders at the same price", () => {
        assertInvariant("timePriorityAtSamePrice", ({ book, taker, fills, seqOf }) =>
            timePriorityAtSamePrice(book, taker, fills, seqOf)
        );
    });

    it("prevents a user from trading against their own resting order", () => {
        assertInvariant("noSelfTrade", ({ taker, fills }) => noSelfTrade(taker, fills));
    });
});

describe("Orderbook invariants with decimal quantities", () => {
    /**
     * Same conservation property, but with fractional quantities. The engine
     * decides an order is fully filled via float equality
     * (`executedQty === order.quantity`, `filled === quantity`), which is not
     * reliable for decimals.
     */
    const decimalStreamArb = fc.array(
        fc.record({
            side: fc.constantFrom<"buy" | "sell">("buy", "sell"),
            price: fc.integer({ min: 99, max: 101 }),
            quantity: fc
                .integer({ min: 1, max: 300 })
                .map((n) => Number((n / 10).toFixed(1))),
            userId: fc.constantFrom("u1", "u2"),
        }),
        { minLength: 1, maxLength: 20 }
    );

    it("conserves quantity with fractional order sizes", () => {
        fc.assert(
            fc.property(decimalStreamArb, (stream) => {
                const violation = firstViolation(stream, ({ before, book, taker, executedQty }) =>
                    conservationOfQuantity(before, book, taker, executedQty)
                );
                if (violation) throw new Error(`[decimal conservation]\n${violation}`);
            }),
            { numRuns: 500, seed: SEED }
        );
    });
});

describe("Orderbook — regression cases found by the property suite", () => {
    /**
     * Hand-written from the shrunk counterexample for the over-fill bug, so it
     * stays covered even if the generators change. A 10-lot ask that has
     * already given 4 must only have 6 left to give.
     */
    it("does not over-fill a partially filled maker", () => {
        const book = new Orderbook("SOL", [], [], 0, 0);
        book.addOrder({ price: 100, quantity: 10, orderId: "maker", filled: 0, side: "sell", userId: "u1" });
        book.addOrder({ price: 100, quantity: 4, orderId: "t1", filled: 0, side: "buy", userId: "u2" });
        const { executedQty } = book.addOrder({
            price: 100, quantity: 8, orderId: "t2", filled: 0, side: "buy", userId: "u3",
        });

        // Only 6 remained, so the second taker can get at most 6.
        expect(executedQty).toBeLessThanOrEqual(6);
        const maker = book.asks.find((o) => o.orderId === "maker");
        if (maker) expect(maker.filled).toBeLessThanOrEqual(maker.quantity);
    });

    /**
     * Price priority: with asks resting at 102 then 99, a buy at 102 must take
     * the 99 first regardless of insertion order.
     */
    it("takes the best price regardless of insertion order", () => {
        const book = new Orderbook("SOL", [], [], 0, 0);
        book.addOrder({ price: 102, quantity: 1, orderId: "expensive", filled: 0, side: "sell", userId: "u1" });
        book.addOrder({ price: 99, quantity: 1, orderId: "cheap", filled: 0, side: "sell", userId: "u2" });

        const { fills } = book.addOrder({
            price: 102, quantity: 1, orderId: "taker", filled: 0, side: "buy", userId: "u3",
        });

        expect(fills.length).toBe(1);
        expect(Number(fills[0].price)).toBe(99);
    });
});
