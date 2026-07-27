'use client'

import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter, usePathname } from "next/navigation"
import { useDemoMode } from "../utils/demoMode"

const NAV_LINKS = [
    { label: "Markets", href: "/markets" },
    { label: "Trade", href: "/trade/SOL_USDC" },
];

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter();
    const isDemoMode = useDemoMode();

    return (
        <div className="sticky top-0 z-50 -mx-2 mb-2 border-b border-baseBorderLight bg-baseBackgroundL0/80 px-2 backdrop-blur supports-[backdrop-filter]:bg-baseBackgroundL0/60">
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        className="flex items-center gap-2 text-lg font-bold tracking-tight text-baseTextHighEmphasis"
                        onClick={() => router.push('/')}
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accentBlue to-greenText text-sm text-white">
                            TW
                        </span>
                        Trade Wave
                    </button>
                    <nav className="flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const isActive = route === link.href || (link.href.startsWith("/trade") && route?.startsWith("/trade"));
                            return (
                                <button
                                    key={link.href}
                                    onClick={() => router.push(link.href)}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-baseBackgroundL2 text-baseTextHighEmphasis"
                                            : "text-baseTextMedEmphasis hover:bg-baseBackgroundL1 hover:text-baseTextHighEmphasis"
                                    }`}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {isDemoMode && (
                        <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Demo Mode
                        </span>
                    )}
                    <PrimaryButton>Sign up</PrimaryButton>
                    <SuccessButton>Sign in</SuccessButton>
                </div>
            </div>
        </div>
    )
}
