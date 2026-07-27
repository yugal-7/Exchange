'use client'
import { useEffect, useMemo, useState } from "react";
import { useSession } from "../utils/session";
import { requestAuth } from "../utils/authModalRequest";
import { useOrders } from "../utils/orders";
import { getTickers } from "../utils/httpClient";
import { DEMO_USDC_BALANCE } from "../utils/account";
import { Ticker } from "../utils/types";
import { CoinIcon } from "../components/core/CoinIcon";
import { OrderHistory } from "../components/OrderHistory";

export default function PortfolioPage() {
    const session = useSession();
    const orders = useOrders();
    const [tickers, setTickers] = useState<Ticker[]>();

    useEffect(() => {
        getTickers().then(setTickers);
    }, []);

    const priceMap = useMemo(() => {
        const map = new Map<string, number>();
        tickers?.forEach((t) => map.set(t.symbol, Number(t.lastPrice)));
        return map;
    }, [tickers]);

    const holdings = useMemo(() => {
        const netQty = new Map<string, number>();
        orders.forEach((o) => {
            const signedQty = Number(o.quantity) * (o.side === 'buy' ? 1 : -1);
            netQty.set(o.market, (netQty.get(o.market) ?? 0) + signedQty);
        });
        return Array.from(netQty.entries())
            .filter(([, qty]) => Math.abs(qty) > 0.00001)
            .map(([market, qty]) => ({
                market,
                quantity: qty,
                value: qty * (priceMap.get(market) ?? 0),
            }))
            .sort((a, b) => b.value - a.value);
    }, [orders, priceMap]);

    const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalValue = DEMO_USDC_BALANCE + holdingsValue;

    if (!session) {
        return <SignInPrompt />;
    }

    return (
        <div className="mx-auto flex w-full max-w-[1280px] flex-col py-6">
            <h1 className="mb-4 text-2xl font-semibold text-baseTextHighEmphasis">Portfolio</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Value" value={`$${totalValue.toFixed(2)}`} highlight />
                <StatCard label="Available Balance" value={`$${DEMO_USDC_BALANCE.toFixed(2)} USDC`} />
                <StatCard label="Holdings Value" value={`$${holdingsValue.toFixed(2)}`} />
            </div>

            <div className="mt-4 rounded-xl border border-baseBorderLight bg-baseBackgroundL1 p-4">
                <h2 className="mb-3 text-sm font-semibold text-baseTextHighEmphasis">Holdings</h2>
                {holdings.length === 0 ? (
                    <p className="py-6 text-center text-sm text-baseTextMedEmphasis">
                        No open positions yet — place a demo trade to see it here.
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-baseBorderLight">
                        {holdings.map((h) => (
                            <a
                                key={h.market}
                                href={`/trade/${h.market}`}
                                className="flex items-center gap-3 py-3 transition active:bg-baseBackgroundL2"
                            >
                                <CoinIcon symbol={h.market} size={36} className="border border-baseBorderMed" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <p className="truncate text-sm font-medium text-baseTextHighEmphasis">{h.market.replace('_', '/')}</p>
                                    <p className="text-xs text-baseTextMedEmphasis">{h.quantity.toFixed(4)} held</p>
                                </div>
                                <p className={`text-sm font-semibold tabular-nums ${h.value >= 0 ? "text-baseTextHighEmphasis" : "text-redText"}`}>
                                    ${h.value.toFixed(2)}
                                </p>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <OrderHistory />
        </div>
    );
}

function StatCard({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className={`rounded-xl border p-4 ${highlight ? "border-accentBlue/30 bg-accentBlue/5" : "border-baseBorderLight bg-baseBackgroundL1"}`}>
            <p className="text-xs font-medium text-baseTextMedEmphasis">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-baseTextHighEmphasis">{value}</p>
        </div>
    );
}

function SignInPrompt() {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-baseBackgroundL2 text-2xl">
                👛
            </div>
            <h1 className="text-xl font-semibold text-baseTextHighEmphasis">Sign in to view your portfolio</h1>
            <p className="text-sm text-baseTextMedEmphasis">
                Your demo balance, holdings, and order history live here once you&apos;re signed in.
            </p>
            <button
                onClick={() => requestAuth('signin')}
                className="rounded-lg bg-greenPrimaryButtonBackground px-5 py-2.5 text-sm font-semibold text-greenPrimaryButtonText transition hover:opacity-90 active:scale-[0.98]"
            >
                Sign in
            </button>
        </div>
    );
}
