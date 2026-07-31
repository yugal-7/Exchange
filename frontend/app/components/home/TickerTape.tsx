'use client'
import { useRouter } from "next/navigation";
import { Ticker } from "../../utils/types";
import { CoinIcon } from "../core/CoinIcon";

/**
 * Continuously scrolling strip of every market. The list is rendered twice
 * back-to-back and translated by exactly -50%, which makes the loop seamless
 * regardless of how many markets there are.
 */
export function TickerTape({ tickers }: { tickers: Ticker[] }) {
    const router = useRouter();
    if (!tickers?.length) return null;

    const items = [...tickers, ...tickers];

    return (
        <div className="relative -mx-2 border-y border-baseBorderLight bg-baseBackgroundL1/40">
            <div className="mask-fade-x overflow-hidden">
                {/* group-hover pauses the scroll so a price can actually be read */}
                <div className="group flex w-max">
                    <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
                        {items.map((t, i) => {
                            const pct = Number(t.priceChangePercent) * 100;
                            const isUp = pct >= 0;
                            return (
                                <button
                                    key={`${t.symbol}-${i}`}
                                    onClick={() => router.push(`/trade/${t.symbol}`)}
                                    aria-hidden={i >= tickers.length}
                                    tabIndex={i >= tickers.length ? -1 : 0}
                                    className="flex h-11 shrink-0 items-center gap-2 border-r border-baseBorderLight px-5 transition hover:bg-baseBackgroundL2 active:opacity-70"
                                >
                                    <CoinIcon symbol={t.symbol} size={18} />
                                    <span className="text-xs font-semibold text-baseTextHighEmphasis">
                                        {t.symbol.split("_")[0]}
                                    </span>
                                    <span className="text-xs tabular-nums text-baseTextMedEmphasis">
                                        ${t.lastPrice}
                                    </span>
                                    <span className={`text-xs font-medium tabular-nums ${isUp ? "text-greenText" : "text-redText"}`}>
                                        {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
