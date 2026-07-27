'use client'
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!open || !mounted) return null;

    // Rendered via portal so `fixed inset-0` centers on the real viewport —
    // an ancestor with backdrop-blur (the Appbar) would otherwise become
    // the containing block for a fixed-position child.
    return createPortal(
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-xl border border-baseBorderLight bg-baseBackgroundL1 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
