'use client'
import { useState } from "react";
import { ArrowRight, Cpu, Layers, ShieldCheck } from "lucide-react";
import { SystemDesignModal } from "../SystemDesignModal";

const PILLARS = [
    {
        icon: Cpu,
        title: "Real matching engine",
        body: "A central-limit order book with price-time priority, partial fills, and live depth — not a mock. Orders are matched in-process and settled against user balances.",
    },
    {
        icon: Layers,
        title: "Event-driven services",
        body: "Redis does triple duty: an RPC bridge between API and engine, a work queue draining trades into TimescaleDB, and pub/sub fanning depth updates out over WebSocket.",
    },
    {
        icon: ShieldCheck,
        title: "Proven, not assumed",
        body: "The engine is checked with property-based testing — invariants like “a taker is never filled at a worse price than the book offers” are falsified against thousands of generated order streams.",
    },
];

export function BuiltWith() {
    const [open, setOpen] = useState(false);

    return (
        <section className="mx-auto mt-12 max-w-[1280px] sm:mt-16">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-baseTextHighEmphasis sm:text-2xl">
                        How it&apos;s built
                    </h2>
                    <p className="mt-1 text-sm text-baseTextMedEmphasis">
                        Six services, one order path — from browser to orderbook and back.
                    </p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="group flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-baseBorderMed px-4 text-sm font-medium text-baseTextHighEmphasis transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2 active:scale-95 sm:self-auto"
                >
                    View system design
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PILLARS.map(({ icon: Icon, title, body }) => (
                    <div
                        key={title}
                        className="flex flex-col gap-2.5 rounded-xl border border-baseBorderLight bg-baseBackgroundL1 p-5 transition hover:border-baseBorderMed"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-baseBackgroundL2 text-accentBlue">
                            <Icon size={17} />
                        </span>
                        <h3 className="text-sm font-semibold text-baseTextHighEmphasis">{title}</h3>
                        <p className="text-xs leading-relaxed text-baseTextMedEmphasis">{body}</p>
                    </div>
                ))}
            </div>

            <SystemDesignModal open={open} onClose={() => setOpen(false)} />
        </section>
    );
}
