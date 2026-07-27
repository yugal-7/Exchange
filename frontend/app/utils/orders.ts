import { useSyncExternalStore } from "react";

/**
 * Demo order history — orders placed via SwapUI are simulated fills,
 * recorded here (and in localStorage) purely for the "Recent Orders"
 * panel. No real order ever reaches a backend.
 */

export interface DemoOrder {
    id: string;
    market: string;
    side: "buy" | "sell";
    type: "limit" | "market";
    price: string;
    quantity: string;
    timestamp: number;
}

const STORAGE_KEY = "trade-wave-demo-orders";
const MAX_ORDERS = 50;

let orders: DemoOrder[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

function persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function hydrate() {
    if (hydrated) return;
    hydrated = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            orders = JSON.parse(raw);
        } catch {
            orders = [];
        }
    }
}

export function placeOrder(order: Omit<DemoOrder, "id" | "timestamp">): DemoOrder {
    hydrate();
    const record: DemoOrder = {
        ...order,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
    };
    orders = [record, ...orders].slice(0, MAX_ORDERS);
    persist();
    notify();
    return record;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): DemoOrder[] {
    hydrate();
    return orders;
}

const EMPTY_ORDERS: DemoOrder[] = [];

function getServerSnapshot(): DemoOrder[] {
    return EMPTY_ORDERS;
}

export function useOrders(): DemoOrder[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
