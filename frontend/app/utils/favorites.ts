import { useSyncExternalStore } from "react";

const STORAGE_KEY = "trade-wave-favorites";

let favorites: Set<string> = new Set();
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

function persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
}

function hydrate() {
    if (hydrated) return;
    hydrated = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            favorites = new Set(JSON.parse(raw));
        } catch {
            favorites = new Set();
        }
    }
}

export function toggleFavorite(symbol: string) {
    hydrate();
    favorites = new Set(favorites);
    if (favorites.has(symbol)) {
        favorites.delete(symbol);
    } else {
        favorites.add(symbol);
    }
    persist();
    notify();
}

export function isFavorite(symbol: string): boolean {
    hydrate();
    return favorites.has(symbol);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): Set<string> {
    hydrate();
    return favorites;
}

const EMPTY_FAVORITES: Set<string> = new Set();

function getServerSnapshot(): Set<string> {
    return EMPTY_FAVORITES;
}

export function useFavorites(): Set<string> {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
