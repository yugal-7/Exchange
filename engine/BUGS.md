# Matching engine bug ledger

Bugs in `src/trade/Orderbook.ts` found by the property-based suite in
`src/tests/orderbook.properties.test.ts`. None of these were found by hand — each
one is a case where a randomly generated order stream falsified an invariant, and
fast-check then shrank it to the minimal reproducing sequence shown below.

**Reproduce any of these exactly:**

```bash
cd engine && npm install && FC_SEED=42 npm test
```

> **Status: the suite is intentionally RED.** 9 of 13 properties fail against the
> current orderbook. Each failure below is a real defect, not a flaky test. The
> fixes land in the orderbook rewrite (sorted price levels + FIFO time priority +
> O(1) cancel); this file is the record of what the harness caught first.

| # | Invariant falsified | Severity | Status |
|---|---|---|---|
| 1 | `fillsRespectBestPrice` / `noBetterPriceLeftBehind` | **Critical** — users get worse prices than the book offers | Open |
| 2 | `filledNeverExceedsQuantity` | **Critical** — creates assets from nothing | Open |
| 3 | `noZombieOrders` | **Critical** — immortal orders with negative remaining size | Open |
| 4 | `noCrossedBook` | High — book left crossed, matching silently failed | Open |
| 5 | `depthMatchesRestingQuantity` | High — published market data is wrong | Open |
| 6 | `noSelfTrade` | Medium — wash trading is possible | Open |

---

## 1. No price priority — takers are filled at worse prices than the book offers

**Invariants:** `fillsRespectBestPrice`, `noBetterPriceLeftBehind`

```
#0 buy  1 @ 98 (u1)
#1 buy  1 @ 99 (u1)
#2 sell 1 @ 98 (u1)
```

```
sell taker filled first at 98 while 99 was available
  — price priority violated (taker got a worse price than the book offered)
```

Two bids rest at 98 and 99. A seller willing to accept 98 arrives. They should be
matched against the **99** bid — the best price available to them. Instead they
are filled at **98**, losing 1 unit of quote currency per lot, while the better bid
sits untouched.

**Cause** — `Orderbook.ts:120`. `this.bids` is a plain array that is only ever
`push`ed to (`Orderbook.ts:64`), so it is in *insertion* order, not price order.
The match loop takes the first entry that crosses:

```ts
for (let i = 0; i < this.bids.length; i++) {
    if (this.bids[i].price >= order.price && executedQty < order.quantity) {
```

There is no sort anywhere in the class. `matchBid` (`Orderbook.ts:90`) has the
identical defect against `this.asks`.

This is the single most important behaviour of a matching engine, and it is the
one an interviewer checks first.

---

## 2. Over-fill — the engine executes quantity that does not exist

**Invariant:** `filledNeverExceedsQuantity`

```
#0 sell 1 @ 98 (u1)
#1 buy  2 @ 98 (u1)
#2 sell 2 @ 98 (u1)
```

```
order o1 (buy) is filled 3 on a quantity of 2 — the engine executed 1 units that never existed
```

A 2-lot bid takes a 1-lot fill, leaving 1 available. A 2-lot sell then arrives and
is filled for **2** against that bid, driving `filled` to 3 on a `quantity` of 2.
One unit of the asset was conjured into existence.

**Cause** — `Orderbook.ts:122`:

```ts
const amountRemaining = Math.min(order.quantity - executedQty, this.bids[i].quantity);
```

It caps against the maker's **total** `quantity` instead of its remaining
`quantity - filled`. `matchBid` has the same bug at `Orderbook.ts:92`.

---

## 3. Zombie orders — immortal resting orders with negative remaining size

**Invariant:** `noZombieOrders`

```
#0 sell 1 @ 98 (u1)
#1 buy  2 @ 98 (u1)
#2 sell 2 @ 98 (u1)
```

```
order o1 (buy) rests in the book with remaining=-1 (quantity=2, filled=3)
  — it should have been removed
```

The direct consequence of #2. Cleanup uses strict equality (`Orderbook.ts:135`):

```ts
if (this.bids[i].filled === this.bids[i].quantity) {
```

Once `filled` overshoots to 3 on a quantity of 2, `3 === 2` is never true, so the
order is **never removed**. It stays in the book permanently, continuing to match
against phantom size on every subsequent incoming order. One over-fill therefore
compounds indefinitely.

The same strict equality is also used for the taker's own full-fill check
(`Orderbook.ts:58`, `:72`), which is unsafe for fractional quantities.

---

## 4. Book left crossed

**Invariant:** `noCrossedBook`

```
#0 buy  1 @ 98 (u1)
#1 sell 2 @ 98 (u1)
#2 buy  3 @ 98 (u1)
```

```
book is crossed: best bid 98 >= best ask 98 — these should have matched
```

After this sequence a bid and an ask both rest at 98. Two orders that are willing
to trade with each other are sitting in the book untraded — matching failed to
happen at all. Downstream, this makes the published spread negative.

Fallout from #2/#3: the zombie ask absorbs quantity it doesn't have, so the
incoming bid's remainder rests instead of clearing the real contra side.

---

## 5. Published depth overstates what is actually available

**Invariant:** `depthMatchesRestingQuantity`

```
#0 sell 2 @ 98 (u1)
#1 buy  1 @ 98 (u1)
```

```
depth advertises 2 ask quantity but only 1 actually remains
```

The tightest counterexample the suite found — **two orders**. A 2-lot ask is half
filled, leaving 1, but the depth feed still advertises the full 2.

**Cause** — `Orderbook.ts:167` sums `order.quantity` and ignores `order.filled`:

```ts
asksObj[order.price] += order.quantity;
```

Every consumer of `GET_DEPTH` — the frontend order book, the market maker's
quoting logic — is therefore working from inflated liquidity.

Two further defects in the same method: the result is built by iterating object
keys (`Orderbook.ts:170`), so levels come out in **insertion order rather than
price order**, and there is no top-N bound, so the whole book is serialised on
every update.

---

## 6. No self-trade prevention

**Invariant:** `noSelfTrade`

```
#0 sell 1 @ 98 (u2)
#1 buy  1 @ 98 (u2)
```

```
user u2 traded against their own order o0 (1 @ 98) — self-trade prevention is missing
```

A single user crosses their own resting order. Real venues reject or cancel this
because it enables wash trading and produces misleading volume. Acknowledged as
`//TODO: Add self trade prevention` at `Orderbook.ts:50`; the corresponding test
was declared `it.todo(...)` and so never ran.

---

## Also found (outside the property suite)

- **`engine.test.ts` has never passed.** It asserts `publishWsTrades` is called
  twice for market `TATA_INR`, but `new Engine('SOL')` only constructs a
  `SOL_USDC` book, so `createOrder` throws `"No orderbook found"` and the spy is
  called 0 times. `npm test` was watch-mode (`"test": "vitest"`), so this was
  never surfaced in a one-shot run.
- **`redis` was missing from `engine/package.json`** despite `RedisManager.ts` and
  `index.ts` both importing it. The engine could not start from a clean install.
  Every other service declares `redis@^4.6.14`.
- **`ws/.env` containing `REDIS_PASS` was committed to git** (`ws/.gitignore`
  covered only `node_modules` and `dist`). Now untracked and ignored — **the
  credential itself still needs rotating**, since it remains in history.

## Known gaps not yet covered by the suite

These live in `Engine.ts` rather than `Orderbook.ts` and need a test seam around
the `fs`/`setInterval`/Redis side effects in the `Engine` constructor:

- Cancelling a **sell** credits the wrong asset (`Engine.ts:108-112` adds a
  base-asset quantity to the **quote** balance).
- Locked funds leak when a taker gets price improvement — locked at the taker's
  limit price, released at the maker's fill price.
- Seed balance typo — user `"1"` gets a literal key `quote:` instead of
  `[this.quote]:` (`Engine.ts:407`).
- Order processing is not atomic — the book is mutated before balances are
  validated, so a balance failure leaves a half-applied trade.
