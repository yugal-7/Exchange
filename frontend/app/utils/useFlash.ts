import { useEffect, useRef, useState } from "react";

const FLASH_DURATION_MS = 600;

/**
 * Tracks whether a numeric-ish value just increased or decreased so the
 * caller can briefly flash a background color — a lightweight "this just
 * ticked" cue for live price updates.
 */
export function useFlash(value: string | number | undefined): "up" | "down" | null {
    const [flash, setFlash] = useState<"up" | "down" | null>(null);
    const prevRef = useRef<string | number | undefined>(value);

    useEffect(() => {
        if (value === undefined || value === prevRef.current) return;

        const prev = Number(prevRef.current);
        const next = Number(value);
        prevRef.current = value;

        if (Number.isNaN(prev) || Number.isNaN(next) || prev === next) return;

        setFlash(next > prev ? "up" : "down");
        const timer = setTimeout(() => setFlash(null), FLASH_DURATION_MS);
        return () => clearTimeout(timer);
    }, [value]);

    return flash;
}
