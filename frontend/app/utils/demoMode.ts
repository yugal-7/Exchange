import { useSyncExternalStore } from "react";

/**
 * Tracks whether the app is currently serving simulated data — either
 * because the real API/WebSocket backend is unreachable (auto-detected)
 * or because the user explicitly forced demo mode via the nav bar toggle.
 * httpClient and SignalingManager both report into `isDemoMode`; the
 * `forced` flag is the manual override they both check before attempting
 * a real network call.
 */

let isDemoMode = false;
let forced = false;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export function setDemoMode(value: boolean) {
    if (isDemoMode === value) return;
    isDemoMode = value;
    notify();
}

export function setForcedDemoMode(value: boolean) {
    forced = value;
    notify();
}

export function isForcedDemoMode() {
    return forced;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return isDemoMode;
}

function getServerSnapshot() {
    return false;
}

export function useDemoMode(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
