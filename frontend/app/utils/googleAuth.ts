/**
 * Thin wrapper around Google Identity Services (GSI) for "Sign in with
 * Google". Set NEXT_PUBLIC_GOOGLE_CLIENT_ID (from a Google Cloud OAuth
 * client) to enable the real flow; without it, callers fall back to a
 * demo simulation so the button still works out of the box.
 *
 * Note: the ID token is decoded client-side and never verified against
 * Google's servers — acceptable for this demo app (there's no real
 * backend to hand it to), but not a substitute for server-side
 * verification in a production auth system.
 */

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
                };
            };
        };
    }
}

let scriptPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.google?.accounts?.id) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
        document.head.appendChild(script);
    });
    return scriptPromise;
}

export interface GoogleProfile {
    email: string;
    name?: string;
    picture?: string;
}

export function decodeGoogleCredential(credential: string): GoogleProfile | null {
    try {
        const payload = credential.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = JSON.parse(atob(normalized));
        if (!json.email) return null;
        return { email: json.email, name: json.name, picture: json.picture };
    } catch {
        return null;
    }
}
