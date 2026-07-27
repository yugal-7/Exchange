'use client'
import { Home, LineChart, ArrowLeftRight, Wallet } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const TABS = [
    { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
    { label: "Markets", href: "/markets", icon: LineChart, match: (p: string) => p === "/markets" },
    { label: "Trade", href: "/trade/SOL_USDC", icon: ArrowLeftRight, match: (p: string) => p.startsWith("/trade") },
    { label: "Portfolio", href: "/portfolio", icon: Wallet, match: (p: string) => p === "/portfolio" },
];

export function MobileTabBar() {
    const router = useRouter();
    const pathname = usePathname() ?? "";

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-baseBorderLight bg-baseBackgroundL0/95 backdrop-blur supports-[backdrop-filter]:bg-baseBackgroundL0/80 md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="mx-auto flex h-16 max-w-[1280px] items-stretch justify-around">
                {TABS.map((tab) => {
                    const active = tab.match(pathname);
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.href}
                            onClick={() => router.push(tab.href)}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition active:scale-95 ${
                                active ? "text-baseTextHighEmphasis" : "text-baseTextMedEmphasis"
                            }`}
                        >
                            {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accentBlue" />}
                            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                            <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
