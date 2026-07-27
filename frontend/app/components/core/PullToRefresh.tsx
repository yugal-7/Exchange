'use client'
import { ReactNode, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 64;
const MAX_PULL = 90;

/**
 * Mobile-only pull-to-refresh: drag down from the top of the page to
 * refetch. No-ops on desktop (the indicator is md:hidden and pointer
 * users don't trigger touch handlers).
 */
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void> | void, children: ReactNode }) {
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (startY.current === null || refreshing) return;
        const delta = e.touches[0].clientY - startY.current;
        if (delta > 0 && window.scrollY <= 0) {
            setPull(Math.min(delta * 0.5, MAX_PULL));
        }
    };

    const onTouchEnd = async () => {
        if (pull > THRESHOLD && !refreshing) {
            setRefreshing(true);
            setPull(56);
            await onRefresh();
            setRefreshing(false);
        }
        setPull(0);
        startY.current = null;
    };

    return (
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div
                className="flex items-center justify-center overflow-hidden transition-[height] duration-200 md:hidden"
                style={{ height: pull }}
            >
                <RefreshCw
                    size={18}
                    className={`text-baseTextMedEmphasis ${refreshing ? "animate-spin" : ""}`}
                    style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
                />
            </div>
            {children}
        </div>
    );
}
