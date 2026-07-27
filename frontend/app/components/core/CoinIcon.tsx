'use client'
import { useState } from "react";

function symbolColor(symbol: string): string {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 62%, 42%)`;
}

function baseAsset(symbol: string): string {
    return symbol.split('_')[0];
}

/**
 * Renders a coin's logo from the external icon CDN, falling back to a
 * deterministic colored initials badge if the image fails to load —
 * so every market shows an icon even for coins the CDN doesn't have.
 */
export function CoinIcon({ symbol, size = 32, className = "" }: { symbol: string, size?: number, className?: string }) {
    const [errored, setErrored] = useState(false);
    const base = baseAsset(symbol);

    if (errored) {
        return (
            <div
                className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
                style={{ width: size, height: size, background: symbolColor(base), fontSize: size * 0.36 }}
            >
                {base.slice(0, 2).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            alt={base}
            loading="lazy"
            decoding="async"
            width={size}
            height={size}
            className={`shrink-0 rounded-full bg-baseBackgroundL2 object-cover ${className}`}
            style={{ width: size, height: size }}
            src={`https://backpack.exchange/coins/${base.toLowerCase()}.svg`}
            onError={() => setErrored(true)}
        />
    );
}
