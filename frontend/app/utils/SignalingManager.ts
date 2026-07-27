import { Ticker } from "./types";
import { getDummyDepth, getDummyTicker } from "./dummyData";
import { setDemoMode } from "./demoMode";

export const BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
const CONNECT_TIMEOUT_MS = 4000;
const SIMULATION_INTERVAL_MS = 1500;

export class SignalingManager {
    private ws: WebSocket | null = null;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;
    private usingDummyFeed: boolean = false;
    private subscriptions: Set<string> = new Set();
    private simulationTimer: ReturnType<typeof setInterval> | null = null;
    private connectTimer: ReturnType<typeof setTimeout> | null = null;

    private constructor() {
        this.bufferedMessages = [];
        this.id = 1;
        this.connect();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    private connect() {
        try {
            this.ws = new WebSocket(BASE_URL);
        } catch (error) {
            this.startDummyFeed();
            return;
        }

        this.connectTimer = setTimeout(() => {
            if (!this.initialized) {
                this.startDummyFeed();
            }
        }, CONNECT_TIMEOUT_MS);

        this.ws.onopen = () => {
            if (this.connectTimer) clearTimeout(this.connectTimer);
            this.initialized = true;
            setDemoMode(false);
            this.bufferedMessages.forEach((message) => {
                this.ws?.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        };

        this.ws.onerror = () => {
            this.startDummyFeed();
        };

        this.ws.onclose = () => {
            if (!this.usingDummyFeed) {
                this.startDummyFeed();
            }
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;

            if (type === "ticker") {
                const newTicker: Partial<Ticker> = {
                    lastPrice: message.data.c,
                    high: message.data.h,
                    low: message.data.l,
                    volume: message.data.v,
                    quoteVolume: message.data.V,
                    symbol: message.data.s,
                };
                this.dispatch("ticker", newTicker);
            }
            if (type === "depth") {
                this.dispatch("depth", { bids: message.data.b, asks: message.data.a });
            }
        };
    }

    /** Connection to the real backend failed (or never came up in time) — keep the UI alive with a simulated feed. */
    private startDummyFeed() {
        if (this.usingDummyFeed) return;
        this.usingDummyFeed = true;
        setDemoMode(true);
        console.warn("Exchange WebSocket unavailable, switching to simulated demo feed.");

        if (this.connectTimer) clearTimeout(this.connectTimer);
        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            try {
                this.ws.close();
            } catch {
                // already closed/never opened
            }
        }

        this.initialized = true;
        this.bufferedMessages = [];
        this.simulationTimer = setInterval(() => this.emitSimulatedUpdates(), SIMULATION_INTERVAL_MS);
    }

    private emitSimulatedUpdates() {
        this.subscriptions.forEach((channel) => {
            const [type, market] = channel.split(".");
            if (!market) return;

            if (type === "ticker") {
                const ticker = getDummyTicker(market);
                this.dispatch("ticker", ticker);
            }
            if (type === "depth") {
                const depth = getDummyDepth(market);
                this.dispatch("depth", { bids: depth.bids.slice(0, 8), asks: depth.asks.slice(0, 8) });
            }
        });
    }

    private dispatch(type: string, payload: any) {
        if (this.callbacks[type]) {
            this.callbacks[type].forEach(({ callback }: any) => callback(payload));
        }
    }

    sendMessage(message: any) {
        const { method, params } = message;
        if (Array.isArray(params)) {
            if (method === "SUBSCRIBE") {
                params.forEach((p: string) => this.subscriptions.add(p));
            }
            if (method === "UNSUBSCRIBE") {
                params.forEach((p: string) => this.subscriptions.delete(p));
            }
        }

        if (this.usingDummyFeed) {
            // Simulation loop reads directly from `this.subscriptions`; nothing to send.
            return;
        }

        const messageToSend = {
            ...message,
            id: this.id++
        }
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws?.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex((callback: { id: string; }) => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}
