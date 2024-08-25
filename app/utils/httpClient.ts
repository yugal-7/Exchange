import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";

const BASE_URL = "https://exchange-proxy.100xdevs.com/api/v1";

export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);
    if (!ticker) {
        throw new Error(`No ticker found for ${market}`);
    }
    return ticker;
}
const x = getTickers()

export async function getTickers(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 1;
}

export async function getDepth(market: string): Promise<Depth>{
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}

export async function getTrades(market: string): Promise<Trade[]>{
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval:string, startTime: number, endTime: number){
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((a,b) => (Number(a.end) < Number(b.end) ? -1 : 1));
}