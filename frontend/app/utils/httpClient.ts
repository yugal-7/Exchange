import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";
import { getDummyDepth, getDummyKlines, getDummyTicker, getDummyTickers, getDummyTrades } from "./dummyData";
import { isForcedDemoMode, setDemoMode } from "./demoMode";

const BASE_URL = "https://exchange-api-515503941182.us-central1.run.app/api/v1";
const REQUEST_TIMEOUT_MS = 5000;

async function withDummyFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
    if (isForcedDemoMode()) {
        setDemoMode(true);
        return fallback();
    }
    try {
        const result = await request();
        setDemoMode(false);
        return result;
    } catch (error) {
        console.warn("Exchange API unavailable, falling back to demo data.", error);
        setDemoMode(true);
        return fallback();
    }
}

export async function getTicker(market: string): Promise<Ticker> {
    return withDummyFallback(
        async () => {
            const tickers = await getTickers();
            const ticker = tickers.find((t) => t.symbol === market);
            if (!ticker) {
                throw new Error(`No ticker found for ${market}`);
            }
            return ticker;
        },
        () => getDummyTicker(market)
    );
}

export async function getTickers(): Promise<Ticker[]> {
    return withDummyFallback(
        async () => {
            const response = await axios.get(`${BASE_URL}/tickers`, { timeout: REQUEST_TIMEOUT_MS });
            return response.data;
        },
        () => getDummyTickers()
    );
}

export async function getDepth(market: string): Promise<Depth> {
    return withDummyFallback(
        async () => {
            const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`, { timeout: REQUEST_TIMEOUT_MS });
            return response.data;
        },
        () => getDummyDepth(market)
    );
}

export async function getTrades(market: string): Promise<Trade[]> {
    return withDummyFallback(
        async () => {
            const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`, { timeout: REQUEST_TIMEOUT_MS });
            return response.data;
        },
        () => getDummyTrades(market)
    );
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    return withDummyFallback(
        async () => {
            const response = await axios.get(
                `${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`,
                { timeout: REQUEST_TIMEOUT_MS }
            );
            const data: KLine[] = response.data;
            return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
        },
        () => getDummyKlines(market, interval, startTime, endTime)
    );
}
