import { useSyncExternalStore } from "react";

/**
 * Lets any component (e.g. the Buy/Sell button) ask the Appbar to open
 * the sign in/up modal, without having to lift that state through props.
 */

type Mode = 'signin' | 'signup' | null;

let mode: Mode = null;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export function requestAuth(target: 'signin' | 'signup' = 'signin') {
    mode = target;
    notify();
}

export function clearAuthRequest() {
    mode = null;
    notify();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): Mode {
    return mode;
}

function getServerSnapshot(): Mode {
    return null;
}

export function useAuthModalRequest(): Mode {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
