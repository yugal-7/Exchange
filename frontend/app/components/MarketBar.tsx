"use client";
import { useEffect, useState } from "react";
import { type Ticker as TickerType } from "../utils/types";
import { getTicker } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";
import { CoinIcon } from "./core/CoinIcon";
import { useFlash } from "../utils/useFlash";

export const MarketBar = ({ market }: { market: string }) => {
    const [ticker, setTicker] = useState<TickerType | null>(null);

    useEffect(() => {
        getTicker(market).then(setTicker);
        SignalingManager.getInstance().registerCallback("ticker", (data: Partial<TickerType>) => setTicker(prevTicker => ({
            firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
            high: data?.high ?? prevTicker?.high ?? '',
            lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
            low: data?.low ?? prevTicker?.low ?? '',
            priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
            priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
            quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
            symbol: data?.symbol ?? prevTicker?.symbol ?? '',
            trades: data?.trades ?? prevTicker?.trades ?? '',
            volume: data?.volume ?? prevTicker?.volume ?? '',
        })), `TICKER-${market}`);
        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`ticker.${market}`] });

        return () => {
            SignalingManager.getInstance().deRegisterCallback("ticker", `TICKER-${market}`);
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`ticker.${market}`] });
        }
    }, [market])

    const isUp = Number(ticker?.priceChange) >= 0;
    const flash = useFlash(ticker?.lastPrice);

    return (
        <div className="relative w-full border-b border-baseBorderLight">
            <div className="flex w-full flex-row items-center overflow-x-auto no-scrollbar">
                <div className="flex flex-row items-center gap-8 py-3 pl-2 pr-6">
                    <MarketIdentity market={market} />
                    <Stat
                        label="Last Price"
                        value={ticker ? `$${ticker.lastPrice}` : '—'}
                        valueClassName={`rounded px-1 -mx-1 transition-colors duration-500 ${isUp ? "text-greenText" : "text-redText"} ${flash === "up" ? "bg-greenBackgroundTransparent" : flash === "down" ? "bg-redBackgroundTransparent" : ""}`}
                    />
                    <Stat
                        label="24H Change"
                        value={ticker ? `${isUp ? "+" : ""}${ticker.priceChange} (${(Number(ticker.priceChangePercent) * 100).toFixed(2)}%)` : '—'}
                        valueClassName={isUp ? "text-greenText" : "text-redText"}
                    />
                    <Stat label="24H High" value={ticker ? `$${ticker.high}` : '—'} />
                    <Stat label="24H Low" value={ticker ? `$${ticker.low}` : '—'} />
                    <Stat label="24H Volume" value={ticker ? ticker.volume : '—'} />
                </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-baseBackgroundL0 to-transparent sm:hidden" />
        </div>
    );
}

function Stat({ label, value, valueClassName = "" }: { label: string, value: string, valueClassName?: string }) {
    return (
        <div className="flex flex-shrink-0 flex-col">
            <p className="text-xs font-medium text-baseTextMedEmphasis">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold tabular-nums leading-5 text-baseTextHighEmphasis ${valueClassName}`}>{value}</p>
        </div>
    )
}

function MarketIdentity({ market }: { market: string }) {
    return (
        <div className="flex flex-shrink-0 flex-row items-center gap-2 pr-4">
            <CoinIcon symbol={market} size={36} />
            <p className="text-base font-semibold text-baseTextHighEmphasis">{market.replace("_", " / ")}</p>
        </div>
    )
}
