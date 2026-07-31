import { Depth, KLine, Ticker, Trade } from "./types";

/**
 * Local, self-contained market data used whenever the real API/WS backend
 * is unreachable, so the UI keeps working (demo mode) instead of showing
 * a blank/broken screen.
 */

const BASE_PRICES: Record<string, number> = {
    BTC_USDC: 64_250,
    ETH_USDC: 3_420,
    SOL_USDC: 148.5,
    BNB_USDC: 592,
    XRP_USDC: 0.62,
    DOGE_USDC: 0.14,
    ADA_USDC: 0.45,
    AVAX_USDC: 36.2,
};

export const DUMMY_MARKETS = Object.keys(BASE_PRICES);

function getBasePrice(market: string): number {
    return BASE_PRICES[market] ?? 100;
}

function randomWalk(base: number, volatility: number): number {
    const change = (Math.random() - 0.5) * 2 * volatility;
    return Math.max(base * (1 + change), base * 0.5);
}

function round(value: number, decimals: number): string {
    return value.toFixed(decimals);
}

function decimalsFor(price: number): number {
    if (price >= 1000) return 2;
    if (price >= 1) return 3;
    return 5;
}

export function getDummyTickers(): Ticker[] {
    return DUMMY_MARKETS.map((symbol) => buildTicker(symbol));
}

export function getDummyTicker(market: string): Ticker {
    return buildTicker(market);
}

function buildTicker(symbol: string): Ticker {
    const base = getBasePrice(symbol);
    const decimals = decimalsFor(base);
    const last = randomWalk(base, 0.02);
    const first = randomWalk(base, 0.05);
    const priceChange = last - first;
    const priceChangePercent = first === 0 ? 0 : priceChange / first;
    const high = Math.max(last, first) * (1 + Math.random() * 0.015);
    const low = Math.min(last, first) * (1 - Math.random() * 0.015);

    // Volume is a quantity of the base asset, so it must not scale with price
    // — deriving it from a plausible notional keeps both figures realistic
    // (a $250M day in BTC is a few thousand coins, not a few billion).
    const quoteVolume = 5_000_000 + Math.random() * 500_000_000;
    const volume = quoteVolume / last;

    return {
        firstPrice: round(first, decimals),
        high: round(high, decimals),
        lastPrice: round(last, decimals),
        low: round(low, decimals),
        priceChange: round(priceChange, decimals),
        priceChangePercent: priceChangePercent.toFixed(4),
        quoteVolume: round(quoteVolume, 2),
        symbol,
        trades: String(Math.floor(1_000 + Math.random() * 50_000)),
        volume: round(volume, 2),
    };
}

export function getDummyDepth(market: string): Depth {
    const base = getBasePrice(market);
    const decimals = decimalsFor(base);
    const levels = 20;
    const tick = base * 0.0006;

    const bids: [string, string][] = Array.from({ length: levels }, (_, i) => {
        const price = base - tick * (i + 1) * (1 + Math.random() * 0.3);
        const quantity = Math.random() * (10 / (i + 1) + 0.5);
        return [round(price, decimals), round(quantity, 4)];
    });

    const asks: [string, string][] = Array.from({ length: levels }, (_, i) => {
        const price = base + tick * (i + 1) * (1 + Math.random() * 0.3);
        const quantity = Math.random() * (10 / (i + 1) + 0.5);
        return [round(price, decimals), round(quantity, 4)];
    });

    return {
        bids,
        asks,
        lastUpdateId: String(Date.now()),
    };
}

export function getDummyTrades(market: string, count = 25): Trade[] {
    const base = getBasePrice(market);
    const decimals = decimalsFor(base);
    const now = Date.now();

    return Array.from({ length: count }, (_, i) => {
        const price = randomWalk(base, 0.01);
        const quantity = Math.random() * 4 + 0.01;
        return {
            id: now - i,
            isBuyerMaker: Math.random() > 0.5,
            price: round(price, decimals),
            quantity: round(quantity, 4),
            quoteQuantity: round(price * quantity, 2),
            timestamp: now - i * 1500,
        };
    });
}

const INTERVAL_MS: Record<string, number> = {
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "4h": 4 * 60 * 60_000,
    "1d": 24 * 60 * 60_000,
};

export function getDummyKlines(
    market: string,
    interval: string,
    startTime: number,
    endTime: number
): KLine[] {
    const base = getBasePrice(market);
    const decimals = decimalsFor(base);
    const stepMs = INTERVAL_MS[interval] ?? INTERVAL_MS["1h"];
    const startMs = startTime * 1000;
    const endMs = endTime * 1000;
    const candleCount = Math.max(1, Math.min(500, Math.floor((endMs - startMs) / stepMs)));

    let price = base;
    const candles: KLine[] = [];

    for (let i = 0; i < candleCount; i++) {
        const open = price;
        const close = randomWalk(open, 0.012);
        const high = Math.max(open, close) * (1 + Math.random() * 0.006);
        const low = Math.min(open, close) * (1 - Math.random() * 0.006);
        // Same reasoning as the ticker: derive coin volume from a notional so
        // it stays plausible regardless of the asset's price.
        const quoteVolume = 100_000 + Math.random() * 5_000_000;
        const volume = quoteVolume / close;
        const start = startMs + i * stepMs;
        const end = start + stepMs;

        candles.push({
            close: round(close, decimals),
            end: String(Math.floor(end / 1000)),
            high: round(high, decimals),
            low: round(low, decimals),
            open: round(open, decimals),
            quoteVolume: round(quoteVolume, 2),
            start: String(Math.floor(start / 1000)),
            trades: String(Math.floor(50 + Math.random() * 500)),
            volume: round(volume, 2),
        });

        price = close;
    }

    return candles;
}
