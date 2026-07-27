import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens a numeric string toward its latest value instead of
 * snapping instantly, so live price ticks feel alive. Formats back to
 * the same decimal precision as the incoming string so it doesn't
 * jitter between different numbers of decimal places mid-animation.
 */
export function useAnimatedNumber(value: string | undefined, durationMs = 450): string {
    const [display, setDisplay] = useState(value ?? "");
    const currentRef = useRef<number>(Number(value) || 0);
    const frameRef = useRef<number>();

    useEffect(() => {
        if (value === undefined) return;
        const to = Number(value);
        if (Number.isNaN(to)) {
            setDisplay(value);
            return;
        }

        if (frameRef.current) cancelAnimationFrame(frameRef.current);

        const from = currentRef.current;
        if (from === to) {
            setDisplay(value);
            return;
        }

        const decimals = (value.split(".")[1] || "").length;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (to - from) * eased;
            currentRef.current = current;
            setDisplay(current.toFixed(decimals));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                currentRef.current = to;
            }
        };
        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value, durationMs]);

    return display;
}
