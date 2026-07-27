'use client'
import { dismissToast, useToasts } from "../../utils/toast";

export function Toaster() {
    const toasts = useToasts();
    if (!toasts.length) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                        t.variant === "success"
                            ? "border-greenBorder/30 bg-greenBackgroundTransparent text-greenText"
                            : t.variant === "error"
                            ? "border-redBorder/30 bg-redBackgroundTransparent text-redText"
                            : "border-baseBorderMed bg-baseBackgroundL2 text-baseTextHighEmphasis"
                    }`}
                >
                    <span>{t.text}</span>
                    <button onClick={() => dismissToast(t.id)} className="text-baseTextMedEmphasis transition hover:text-baseTextHighEmphasis" aria-label="Dismiss">
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
