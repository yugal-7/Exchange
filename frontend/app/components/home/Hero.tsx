'use client'
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Ticker } from "../../utils/types";
import { CoinIcon } from "../core/CoinIcon";
import { useAnimatedNumber } from "../../utils/useAnimatedNumber";
import { useFlash } from "../../utils/useFlash";

const compact = (n: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function Hero({ tickers, loading }: { tickers: Ticker[], loading: boolean }) {
    const router = useRouter();

    // The most active market headlines the hero — a trading app should lead
    // with live data rather than a static banner.
    const featured = [...(tickers ?? [])].sort((a, b) => Number(b.trades) - Number(a.trades))[0];
    const totalVolume = (tickers ?? []).reduce((s, t) => s + Number(t.quoteVolume || 0), 0);
    const totalTrades = (tickers ?? []).reduce((s, t) => s + Number(t.trades || 0), 0);

    return (
        <section className="relative -mx-4 overflow-hidden px-4 pb-10 pt-10 sm:-mx-6 sm:px-6 sm:pb-14 sm:pt-16 lg:-mx-8 lg:px-8">
            <Backdrop />

            <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-xl flex-col items-start gap-5 animate-rise">
                    <span className="inline-flex items-center gap-2 rounded-full border border-baseBorderMed bg-baseBackgroundL1/70 px-3 py-1.5 text-xs font-medium text-baseTextMedEmphasis backdrop-blur">
                        <ShieldCheck size={13} className="text-greenText" />
                        Matching engine verified by property-based tests
                    </span>

                    <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-baseTextHighEmphasis sm:text-5xl lg:text-6xl">
                        Trade at the{" "}
                        <span className="bg-gradient-to-r from-accentBlue via-sky-300 to-greenText bg-clip-text text-transparent">
                            best price
                        </span>
                        , every time.
                    </h1>

                    <p className="text-balance text-base leading-relaxed text-baseTextMedEmphasis sm:text-lg">
                        A full central-limit order book exchange — matching engine, real-time depth,
                        and settlement — built from scratch and held to invariants that prove price
                        priority is never broken.
                    </p>

                    <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
                        <button
                            onClick={() => router.push(featured ? `/trade/${featured.symbol}` : "/trade/SOL_USDC")}
                            className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-greenPrimaryButtonBackground px-6 text-sm font-semibold text-greenPrimaryButtonText shadow-lg shadow-greenPrimaryButtonBackground/20 transition hover:opacity-90 active:scale-[0.98]"
                        >
                            Start Trading
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <button
                            onClick={() => router.push("/markets")}
                            className="flex h-12 items-center justify-center rounded-xl border border-baseBorderMed bg-baseBackgroundL1/60 px-6 text-sm font-semibold text-baseTextHighEmphasis backdrop-blur transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2 active:scale-[0.98]"
                        >
                            Explore Markets
                        </button>
                    </div>

                    <dl className="mt-2 grid w-full grid-cols-3 gap-3 border-t border-baseBorderLight pt-5 sm:gap-6">
                        <Stat label="Markets" value={loading ? "—" : String(tickers.length)} />
                        <Stat label="24h Volume" value={loading ? "—" : `$${compact(totalVolume)}`} />
                        <Stat label="24h Trades" value={loading ? "—" : compact(totalTrades)} />
                    </dl>
                </div>

                <FeaturedCard ticker={featured} loading={loading} />
            </div>
        </section>
    );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-baseTextMedEmphasis">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums text-baseTextHighEmphasis sm:text-xl">{value}</dd>
        </div>
    );
}

/** Live price card — the hero's visual anchor, and real data rather than art. */
function FeaturedCard({ ticker, loading }: { ticker?: Ticker, loading: boolean }) {
    const router = useRouter();
    const animated = useAnimatedNumber(ticker?.lastPrice);
    const flash = useFlash(ticker?.lastPrice);

    if (loading || !ticker) {
        return (
            <div className="h-[228px] w-full max-w-md animate-pulse rounded-2xl border border-baseBorderLight bg-baseBackgroundL1/60 lg:w-[380px]" />
        );
    }

    const pct = Number(ticker.priceChangePercent) * 100;
    const isUp = pct >= 0;
    const base = ticker.symbol.split("_")[0];

    return (
        <button
            onClick={() => router.push(`/trade/${ticker.symbol}`)}
            style={{ animationDelay: "120ms" }}
            className="group w-full max-w-md animate-rise rounded-2xl border border-baseBorderLight bg-baseBackgroundL1/80 p-5 text-left shadow-2xl shadow-black/30 backdrop-blur transition hover:border-baseBorderFocus active:scale-[0.99] lg:w-[380px]"
        >
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-baseTextMedEmphasis">
                    Most active
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-greenText">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-greenText opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-greenText" />
                    </span>
                    Live
                </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <CoinIcon symbol={ticker.symbol} size={44} className="border border-baseBorderMed" />
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-baseTextHighEmphasis">{base}</span>
                    <span className="text-xs text-baseTextMedEmphasis">{ticker.symbol.replace("_", " / ")}</span>
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
                <span
                    className={`rounded-lg px-1.5 py-0.5 -mx-1.5 text-3xl font-bold tabular-nums text-baseTextHighEmphasis transition-colors duration-500 ${
                        flash === "up" ? "bg-greenBackgroundTransparent" : flash === "down" ? "bg-redBackgroundTransparent" : ""
                    }`}
                >
                    ${animated}
                </span>
                <span
                    className={`rounded-full px-2 py-1 text-sm font-semibold tabular-nums ${
                        isUp ? "bg-greenBackgroundTransparent text-greenText" : "bg-redBackgroundTransparent text-redText"
                    }`}
                >
                    {isUp ? "+" : ""}{pct.toFixed(2)}%
                </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-baseBorderLight pt-4 text-xs">
                <MiniStat label="24h High" value={`$${ticker.high}`} />
                <MiniStat label="24h Low" value={`$${ticker.low}`} />
                <MiniStat label="24h Vol" value={compact(Number(ticker.volume))} />
            </div>
        </button>
    );
}

function MiniStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[10px] uppercase tracking-wide text-baseTextMedEmphasis">{label}</span>
            <span className="truncate font-medium tabular-nums text-baseTextHighEmphasis">{value}</span>
        </div>
    );
}

/**
 * Purely decorative background. Built from gradients and a CSS grid rather
 * than an image so the page has no external asset dependency and nothing to
 * wait on before first paint.
 */
function Backdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-grid mask-fade-b" />
            <div className="animate-aurora absolute -left-1/4 -top-1/2 h-[80%] w-[70%] rounded-full bg-accentBlue/20 blur-[110px]" />
            <div
                className="animate-aurora absolute -right-1/4 -top-1/3 h-[70%] w-[60%] rounded-full bg-greenText/10 blur-[120px]"
                style={{ animationDelay: "-9s" }}
            />
        </div>
    );
}
