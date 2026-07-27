import { useSyncExternalStore } from "react";

/**
 * A client-only mock session (no backend auth exists in this app yet).
 * Stored in localStorage purely so the signed-in state survives a
 * refresh; nothing is ever sent over the network.
 */

export interface Session {
    email: string;
}

const STORAGE_KEY = "trade-wave-demo-session";
let session: Session | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export function signIn(email: string) {
    session = { email };
    hydrated = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    notify();
}

export function signOut() {
    session = null;
    hydrated = true;
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    if (!hydrated) {
        hydrated = true;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                session = JSON.parse(raw);
            } catch {
                session = null;
            }
        }
    }
    return session;
}

function getServerSnapshot(): Session | null {
    return null;
}

export function useSession(): Session | null {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
