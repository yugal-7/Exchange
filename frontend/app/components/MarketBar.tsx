"use client";
import { useEffect, useState } from "react";
import { type Ticker as TickerType } from "../utils/types";
import { getTicker } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";

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

    return (
        <div className="flex w-full flex-row items-center overflow-x-auto border-b border-baseBorderLight no-scrollbar">
            <div className="flex flex-row items-center gap-8 py-3 pl-2 pr-4">
                <MarketIdentity market={market} />
                <Stat label="Last Price" value={ticker ? `$${ticker.lastPrice}` : '—'} valueClassName={isUp ? "text-greenText" : "text-redText"} />
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
    const getMarketName = (name: string) => {
        const index = name.indexOf('_USDC');
        return name.substring(0, index);
    }
    return (
        <div className="flex flex-shrink-0 flex-row items-center gap-2 pr-4">
            <img
                alt="coin logo"
                loading="lazy"
                decoding="async"
                className="h-9 w-9 rounded-full"
                src={`https://backpack.exchange/coins/${getMarketName(market).toLowerCase()}.svg`}
            />
            <p className="text-base font-semibold text-baseTextHighEmphasis">{market.replace("_", " / ")}</p>
        </div>
    )
}
