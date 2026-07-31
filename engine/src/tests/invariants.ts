import { Fill, Order, Orderbook } from "../trade/Orderbook";

/**
 * Executable statements of what must ALWAYS be true of a correct matching
 * engine, regardless of what order stream it is fed.
 *
 * Each predicate returns `null` when it holds, or a human-readable string
 * describing exactly how it was violated. Property tests below assert that
 * every invariant returns `null` after every single operation, across
 * thousands of randomly generated order streams.
 *
 * The point of writing them this way — rather than as hand-picked example
 * assertions — is that they are statements about ALL possible inputs. A
 * generator then tries to find any input that falsifies them, and shrinks
 * whatever it finds to a minimal reproducing case.
 */

export type Violation = string | null;

/** Quantity of an order that has not yet been executed. */
export const remaining = (o: Order) => o.quantity - o.filled;

/** Deep copy of book state, since matching mutates resting orders in place. */
export interface BookState {
    bids: Order[];
    asks: Order[];
}

export function snapshotBook(book: Orderbook): BookState {
    return {
        bids: book.bids.map((o) => ({ ...o })),
        asks: book.asks.map((o) => ({ ...o })),
    };
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const EPS = 1e-9;

// ---------------------------------------------------------------------------
// Book-state invariants — checked after every operation
// ---------------------------------------------------------------------------

/**
 * No order may ever be executed for more than it was placed for. Violating
 * this means the engine has matched quantity that does not exist, i.e. it
 * has created an asset out of nothing.
 */
export function filledNeverExceedsQuantity(book: Orderbook): Violation {
    for (const o of [...book.bids, ...book.asks]) {
        if (o.filled > o.quantity + EPS) {
            return `order ${o.orderId} (${o.side}) is filled ${o.filled} on a quantity of ${o.quantity} ` +
                `— the engine executed ${o.filled - o.quantity} units that never existed`;
        }
    }
    return null;
}

/**
 * A resting order with nothing left to give must not still be in the book.
 * Such an order is a "zombie": it keeps matching forever against phantom size.
 */
export function noZombieOrders(book: Orderbook): Violation {
    for (const o of [...book.bids, ...book.asks]) {
        if (remaining(o) <= EPS) {
            return `order ${o.orderId} (${o.side}) rests in the book with remaining=${remaining(o)} ` +
                `(quantity=${o.quantity}, filled=${o.filled}) — it should have been removed`;
        }
    }
    return null;
}

/**
 * If the best bid is at or above the best ask, those two orders should have
 * traded with each other. A crossed book means matching failed to happen.
 */
export function noCrossedBook(book: Orderbook): Violation {
    if (book.bids.length === 0 || book.asks.length === 0) return null;
    const bestBid = Math.max(...book.bids.map((o) => o.price));
    const bestAsk = Math.min(...book.asks.map((o) => o.price));
    if (bestBid >= bestAsk - EPS) {
        return `book is crossed: best bid ${bestBid} >= best ask ${bestAsk} — these should have matched`;
    }
    return null;
}

/**
 * Published depth must reflect what is actually available to trade, which is
 * the REMAINING size of resting orders, not their original size.
 */
export function depthMatchesRestingQuantity(book: Orderbook): Violation {
    const depth = book.getDepth();
    const expectedBids = sum(book.bids.map(remaining));
    const expectedAsks = sum(book.asks.map(remaining));
    const reportedBids = sum(depth.bids.map(([, q]) => Number(q)));
    const reportedAsks = sum(depth.asks.map(([, q]) => Number(q)));

    if (Math.abs(reportedBids - expectedBids) > EPS) {
        return `depth advertises ${reportedBids} bid quantity but only ${expectedBids} actually remains`;
    }
    if (Math.abs(reportedAsks - expectedAsks) > EPS) {
        return `depth advertises ${reportedAsks} ask quantity but only ${expectedAsks} actually remains`;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Match-result invariants — checked against the book state before the match
// ---------------------------------------------------------------------------

/**
 * Conservation: the contra side must shrink by exactly the quantity that was
 * reported as executed. Any discrepancy means quantity was created/destroyed.
 */
export function conservationOfQuantity(
    before: BookState,
    book: Orderbook,
    taker: Order,
    executedQty: number
): Violation {
    const contraBefore = taker.side === "buy" ? before.asks : before.bids;
    const contraAfter = taker.side === "buy" ? book.asks : book.bids;

    // A taker's own unfilled remainder rests on its own side, so only the
    // contra side is considered here.
    const consumed = sum(contraBefore.map(remaining)) - sum(contraAfter.map(remaining));
    if (Math.abs(consumed - executedQty) > EPS) {
        return `engine reported executedQty=${executedQty} but the contra side changed by ${consumed} ` +
            `— ${Math.abs(consumed - executedQty)} units were ${consumed > executedQty ? "destroyed" : "created"}`;
    }
    return null;
}

/** The reported fills must add up to the reported executed quantity. */
export function fillsSumToExecutedQty(fills: Fill[], executedQty: number): Violation {
    const total = sum(fills.map((f) => f.qty));
    if (Math.abs(total - executedQty) > EPS) {
        return `fills sum to ${total} but executedQty is ${executedQty}`;
    }
    return null;
}

/**
 * PRICE PRIORITY. A taker must be filled at the best available contra price
 * first, then progressively worse. Concretely: for a buy, fill prices must be
 * non-decreasing and must start at the lowest ask in the book.
 */
export function fillsRespectBestPrice(
    before: BookState,
    taker: Order,
    fills: Fill[]
): Violation {
    if (fills.length === 0) return null;
    const contra = taker.side === "buy" ? before.asks : before.bids;
    const eligible = contra.filter((o) =>
        taker.side === "buy" ? o.price <= taker.price + EPS : o.price >= taker.price - EPS
    );
    if (eligible.length === 0) return null;

    const bestAvailable = taker.side === "buy"
        ? Math.min(...eligible.map((o) => o.price))
        : Math.max(...eligible.map((o) => o.price));

    const prices = fills.map((f) => Number(f.price));

    // The very first fill must be at the best price in the book.
    if (Math.abs(prices[0] - bestAvailable) > EPS) {
        return `${taker.side} taker filled first at ${prices[0]} while ${bestAvailable} was available ` +
            `— price priority violated (taker got a worse price than the book offered)`;
    }

    // Subsequent fills may only get worse, never better.
    for (let i = 1; i < prices.length; i++) {
        const worsening = taker.side === "buy" ? prices[i] >= prices[i - 1] - EPS : prices[i] <= prices[i - 1] + EPS;
        if (!worsening) {
            return `${taker.side} taker fill prices are out of order: ${prices[i - 1]} then ${prices[i]} ` +
                `— the book was not walked best-price-first`;
        }
    }
    return null;
}

/**
 * After a match, no contra order at a price BETTER than one that was executed
 * may still be sitting there with size available. If it is, the engine skipped
 * over a better price.
 */
export function noBetterPriceLeftBehind(
    book: Orderbook,
    taker: Order,
    fills: Fill[]
): Violation {
    if (fills.length === 0) return null;
    const contraAfter = taker.side === "buy" ? book.asks : book.bids;
    const prices = fills.map((f) => Number(f.price));
    const worstExecuted = taker.side === "buy" ? Math.max(...prices) : Math.min(...prices);

    for (const o of contraAfter) {
        if (remaining(o) <= EPS) continue;
        const isBetter = taker.side === "buy" ? o.price < worstExecuted - EPS : o.price > worstExecuted + EPS;
        if (isBetter) {
            return `${taker.side} taker executed at ${worstExecuted} but order ${o.orderId} at the better price ` +
                `${o.price} still has ${remaining(o)} available — a better price was skipped`;
        }
    }
    return null;
}

/**
 * TIME PRIORITY. At a single price level, the order that arrived first must be
 * consumed first. `seq` is supplied by the harness (arrival index), since the
 * production Order type carries no timestamp.
 */
export function timePriorityAtSamePrice(
    book: Orderbook,
    taker: Order,
    fills: Fill[],
    seqOf: Map<string, number>
): Violation {
    if (fills.length === 0) return null;
    const contraAfter = taker.side === "buy" ? book.asks : book.bids;
    const filledIds = new Set(fills.map((f) => f.markerOrderId));

    for (const executedId of filledIds) {
        const executedSeq = seqOf.get(executedId);
        if (executedSeq === undefined) continue;
        const executedPrice = Number(fills.find((f) => f.markerOrderId === executedId)!.price);

        for (const o of contraAfter) {
            if (remaining(o) <= EPS) continue;
            if (Math.abs(o.price - executedPrice) > EPS) continue;
            const restingSeq = seqOf.get(o.orderId);
            if (restingSeq === undefined) continue;
            if (restingSeq < executedSeq && o.filled === 0) {
                return `at price ${executedPrice}, order ${executedId} (arrived #${executedSeq}) was filled while ` +
                    `older order ${o.orderId} (arrived #${restingSeq}) was untouched — time priority violated`;
            }
        }
    }
    return null;
}

/** A user must never trade against their own resting order. */
export function noSelfTrade(taker: Order, fills: Fill[]): Violation {
    for (const f of fills) {
        if (f.otherUserId === taker.userId) {
            return `user ${taker.userId} traded against their own order ${f.markerOrderId} ` +
                `(${f.qty} @ ${f.price}) — self-trade prevention is missing`;
        }
    }
    return null;
}

// ---------------------------------------------------------------------------

/**
 * Runs every applicable invariant and returns the first violation found, or
 * null if the engine behaved correctly for this operation.
 */
export function checkAll(args: {
    before: BookState;
    book: Orderbook;
    taker: Order;
    fills: Fill[];
    executedQty: number;
    seqOf: Map<string, number>;
    /** Self-trade prevention is not implemented yet; opt in explicitly. */
    checkSelfTrade?: boolean;
}): Violation {
    const { before, book, taker, fills, executedQty, seqOf } = args;
    return (
        filledNeverExceedsQuantity(book) ??
        noZombieOrders(book) ??
        noCrossedBook(book) ??
        depthMatchesRestingQuantity(book) ??
        fillsSumToExecutedQty(fills, executedQty) ??
        conservationOfQuantity(before, book, taker, executedQty) ??
        fillsRespectBestPrice(before, taker, fills) ??
        noBetterPriceLeftBehind(book, taker, fills) ??
        timePriorityAtSamePrice(book, taker, fills, seqOf) ??
        (args.checkSelfTrade ? noSelfTrade(taker, fills) : null)
    );
}
