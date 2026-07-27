import { useSyncExternalStore } from "react";

/**
 * Tracks whether the app is currently serving simulated data because the
 * real API/WebSocket backend is unreachable. Both httpClient and
 * SignalingManager report into this so the UI can surface a single,
 * consistent "Demo Mode" indicator.
 */

let isDemoMode = false;
const listeners = new Set<() => void>();

export function setDemoMode(value: boolean) {
    if (isDemoMode === value) return;
    isDemoMode = value;
    listeners.forEach((listener) => listener());
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
