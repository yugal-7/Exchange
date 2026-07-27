import { useSyncExternalStore } from "react";

export interface ToastMessage {
    id: number;
    text: string;
    variant: "success" | "error" | "info";
}

let toasts: ToastMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export function showToast(text: string, variant: ToastMessage["variant"] = "info") {
    const toast = { id: nextId++, text, variant };
    toasts = [...toasts, toast];
    notify();
    setTimeout(() => dismissToast(toast.id), 3500);
}

export function dismissToast(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return toasts;
}

const EMPTY_TOASTS: ToastMessage[] = [];

function getServerSnapshot(): ToastMessage[] {
    return EMPTY_TOASTS;
}

export function useToasts(): ToastMessage[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
