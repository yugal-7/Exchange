'use client'
import { ReactNode } from "react";
import { ArrowDown, ArrowRight, Bot, Cpu, Database, Globe, Layers, Radio, Server } from "lucide-react";
import { Modal } from "./core/Modal";

/**
 * An accurate (not idealized) map of how this project's services actually
 * talk to each other, grounded in the real source: api/, engine/, ws/, db/,
 * and mm/. Redis isn't just a cache here — it's used as an RPC bridge
 * (list + pub/sub reply), a work queue, and a pub/sub fan-out, all at once.
 */
export function SystemDesignModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    return (
        <Modal open={open} onClose={onClose} panelClassName="max-w-3xl">
            <h2 className="text-lg font-semibold text-baseTextHighEmphasis">System Design</h2>
            <p className="mt-1 text-xs text-baseTextMedEmphasis">
                How this exchange&apos;s services actually talk to each other — traced from the real source, not a textbook diagram.
            </p>

            <Section title="Placing an order">
                <Flow>
                    <Stage icon={Globe} label="Browser" hint="SwapUI" />
                    <FlowArrow />
                    <Stage icon={Server} label="API" hint="POST /api/v1/order" tone="accent" />
                    <FlowArrow />
                    <Stage icon={Layers} label="Redis" hint='LPUSH "messages"' />
                    <FlowArrow />
                    <Stage icon={Cpu} label="Engine" hint="matches the SOL orderbook" tone="accent" />
                </Flow>
                <p className="mt-3 text-xs text-baseTextMedEmphasis">The engine then fans back out three ways:</p>
                <div className="mt-2 flex flex-col gap-3">
                    <Flow>
                        <Stage icon={Cpu} label="Engine" compact />
                        <FlowArrow />
                        <Stage icon={Layers} label="Redis pub/sub" hint="reply on a per-request clientId channel" />
                        <FlowArrow />
                        <Stage icon={Server} label="API" compact />
                        <FlowArrow />
                        <Stage icon={Globe} label="Browser" hint="order result" compact />
                    </Flow>
                    <Flow>
                        <Stage icon={Cpu} label="Engine" compact />
                        <FlowArrow />
                        <Stage icon={Layers} label="Redis" hint='LPUSH "db_processor"' />
                        <FlowArrow />
                        <Stage icon={Database} label="DB worker" hint="db/src/index.ts" />
                        <FlowArrow />
                        <Stage icon={Database} label="TimescaleDB" hint="sol_prices table" tone="accent" />
                    </Flow>
                    <Flow>
                        <Stage icon={Cpu} label="Engine" compact />
                        <FlowArrow />
                        <Stage icon={Layers} label="Redis pub/sub" hint="ticker.*, depth.* channels" />
                        <FlowArrow />
                        <Stage icon={Radio} label="WS server" />
                        <FlowArrow />
                        <Stage icon={Globe} label="Browser" hint="live ticker & depth" compact />
                    </Flow>
                </div>
            </Section>

            <Section title="Live market data (WebSocket)">
                <Flow>
                    <Stage icon={Globe} label="Browser" hint="SUBSCRIBE ticker.SOL_USDC" />
                    <FlowArrow />
                    <Stage icon={Radio} label="WS server" hint="ws/src/SubscriptionManager.ts" tone="accent" />
                    <FlowArrow />
                    <Stage icon={Layers} label="Redis pub/sub" hint="subscribes once per channel" />
                </Flow>
                <p className="mt-2 text-xs text-baseTextMedEmphasis">
                    The WS server only opens a Redis subscription for a channel the first time a browser asks for it, and shares
                    that single feed across every client subscribed to the same market.
                </p>
            </Section>

            <Section title="Seeding liquidity">
                <Flow>
                    <Stage icon={Bot} label="Market maker" hint="mm/src/index.ts" />
                    <FlowArrow />
                    <Stage icon={Server} label="API" hint="places/cancels bids & asks" />
                    <FlowArrow />
                    <Stage icon={Cpu} label="Engine" hint="same order path as above" />
                </Flow>
                <p className="mt-2 text-xs text-baseTextMedEmphasis">
                    A standalone bot script that continuously quotes both sides of the SOL/USDC book through the normal REST
                    API — it has no special access, it&apos;s just another trader.
                </p>
            </Section>

            <Section title="What Redis is actually doing">
                <ul className="flex flex-col gap-1.5 text-xs text-baseTextMedEmphasis">
                    <li><span className="font-medium text-baseTextHighEmphasis">RPC bridge</span> — API pushes onto a <Code>messages</Code> list and blocks on a reply pub/sub channel keyed by a random client ID; the engine pops the list and publishes the reply.</li>
                    <li><span className="font-medium text-baseTextHighEmphasis">Work queue</span> — the engine pushes trade/order events onto a <Code>db_processor</Code> list; a separate worker drains it into TimescaleDB.</li>
                    <li><span className="font-medium text-baseTextHighEmphasis">Pub/sub fan-out</span> — the engine publishes ticker/depth updates to per-market channels; the WS server relays them to every subscribed browser.</li>
                </ul>
            </Section>

            <Section title="Current shortcuts in this build" tone="warn">
                <ul className="flex flex-col gap-1.5 text-xs text-baseTextMedEmphasis">
                    <li><span className="font-medium text-amber-300">Tickers &amp; klines proxy a third party.</span> <Code>api/src/routes/ticker.ts</Code> and <Code>kline.ts</Code> currently forward straight to Backpack Exchange&apos;s public API rather than reading from the engine or TimescaleDB.</li>
                    <li><span className="font-medium text-amber-300">Trades endpoint is a stub.</span> <Code>api/src/routes/trades.ts</Code> returns <Code>{'{}'}</Code> — recent trades aren&apos;t wired up to the DB yet.</li>
                    <li><span className="font-medium text-amber-300">Frontend demo-mode fallback.</span> When the API or WebSocket backend above is unreachable, the frontend transparently switches to locally generated dummy data (see the &quot;Demo Mode&quot; indicator in the nav) so the UI stays usable end to end.</li>
                </ul>
            </Section>
        </Modal>
    );
}

function Section({ title, tone = "default", children }: { title: string, tone?: "default" | "warn", children: ReactNode }) {
    return (
        <div className={`mt-4 rounded-lg border p-3 ${tone === "warn" ? "border-amber-400/20 bg-amber-400/5" : "border-baseBorderLight bg-baseBackgroundL0/40"}`}>
            <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${tone === "warn" ? "text-amber-300" : "text-baseTextMedEmphasis"}`}>{title}</h3>
            {children}
        </div>
    );
}

function Flow({ children }: { children: ReactNode }) {
    return <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

function FlowArrow() {
    return (
        <>
            <ArrowDown size={14} className="mx-auto shrink-0 text-baseTextMedEmphasis sm:hidden" />
            <ArrowRight size={14} className="hidden shrink-0 text-baseTextMedEmphasis sm:block" />
        </>
    );
}

function Stage({ icon: Icon, label, hint, tone = "default", compact = false }: { icon: typeof Globe, label: string, hint?: string, tone?: "default" | "accent", compact?: boolean }) {
    return (
        <div
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border px-3 text-center sm:flex-none ${compact ? "py-1.5" : "py-2"} ${
                tone === "accent"
                    ? "border-accentBlue/40 bg-accentBlue/10"
                    : "border-baseBorderLight bg-baseBackgroundL2"
            }`}
        >
            <div className="flex items-center gap-1.5">
                <Icon size={13} className="text-baseTextMedEmphasis" />
                <span className="text-xs font-semibold text-baseTextHighEmphasis">{label}</span>
            </div>
            {hint && <span className="text-[10px] leading-tight text-baseTextMedEmphasis">{hint}</span>}
        </div>
    );
}

function Code({ children }: { children: ReactNode }) {
    return <code className="rounded bg-baseBackgroundL2 px-1 py-0.5 font-mono text-[10px] text-baseTextHighEmphasis">{children}</code>;
}
