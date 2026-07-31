'use client'

import { useState } from "react";
import { Menu, Network, X } from "lucide-react";
import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter, usePathname } from "next/navigation"
import { useDemoMode, setForcedDemoMode } from "../utils/demoMode"
import { useSession, signOut, type Session } from "../utils/session"
import { showToast } from "../utils/toast"
import { requestAuth, clearAuthRequest, useAuthModalRequest } from "../utils/authModalRequest"
import { AuthModal } from "./AuthModal"
import { SystemDesignModal } from "./SystemDesignModal"

const NAV_LINKS = [
    { label: "Markets", href: "/markets" },
    { label: "Trade", href: "/trade/SOL_USDC" },
    { label: "Portfolio", href: "/portfolio" },
];

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter();
    const isDemoMode = useDemoMode();
    const session = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [systemDesignOpen, setSystemDesignOpen] = useState(false);
    const authMode = useAuthModalRequest();

    const goto = (href: string) => {
        setMenuOpen(false);
        router.push(href);
    };

    const toggleDemoMode = () => {
        setForcedDemoMode(!isDemoMode);
        window.location.reload();
    };

    const handleSignOut = () => {
        signOut();
        setMenuOpen(false);
        showToast('Signed out', 'info');
    };

    return (
        <div
            className="sticky top-0 z-50 -mx-2 mb-2 border-b border-baseBorderLight bg-baseBackgroundL0/80 px-2 backdrop-blur supports-[backdrop-filter]:bg-baseBackgroundL0/60"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        className="-ml-1 flex min-h-[44px] items-center gap-2 rounded-lg px-1 text-lg font-bold tracking-tight text-baseTextHighEmphasis transition active:opacity-70"
                        onClick={() => goto('/')}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accentBlue to-greenText text-sm text-white">
                            TW
                        </span>
                        <span className="hidden sm:inline">Trade Wave</span>
                    </button>
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => {
                            const isActive = route === link.href || (link.href.startsWith("/trade") && route?.startsWith("/trade"));
                            return (
                                <button
                                    key={link.href}
                                    onClick={() => goto(link.href)}
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

                <div className="hidden items-center gap-3 md:flex">
                    <DemoModeButton isDemoMode={isDemoMode} onClick={toggleDemoMode} />
                    {session ? (
                        <SignedInMenu session={session} onSignOut={handleSignOut} />
                    ) : (
                        <>
                            <PrimaryButton onClick={() => requestAuth('signup')}>Sign up</PrimaryButton>
                            <SuccessButton onClick={() => requestAuth('signin')}>Sign in</SuccessButton>
                        </>
                    )}
                </div>

                <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-baseTextMedEmphasis transition hover:bg-baseBackgroundL2 hover:text-baseTextHighEmphasis active:bg-baseBackgroundL2 md:h-9 md:w-9"
                    onClick={() => setSystemDesignOpen(true)}
                    title="View system design"
                    aria-label="View system design"
                >
                    <Network size={19} />
                </button>

                <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-baseTextHighEmphasis transition active:bg-baseBackgroundL2 md:hidden"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {menuOpen && (
                <div className="flex flex-col gap-1 border-t border-baseBorderLight py-3 md:hidden">
                    <div className="px-3 py-2">
                        <DemoModeButton isDemoMode={isDemoMode} onClick={toggleDemoMode} />
                    </div>
                    <div className="flex flex-col gap-2 px-3 pt-1">
                        {session ? (
                            <button
                                onClick={handleSignOut}
                                className="h-11 rounded-lg border border-baseBorderMed text-sm font-semibold text-baseTextHighEmphasis transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2 active:bg-baseBackgroundL2"
                            >
                                Sign out ({session.name ?? session.email})
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <PrimaryButton onClick={() => { setMenuOpen(false); requestAuth('signup'); }}>Sign up</PrimaryButton>
                                <SuccessButton onClick={() => { setMenuOpen(false); requestAuth('signin'); }}>Sign in</SuccessButton>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AuthModal open={authMode !== null} mode={authMode ?? 'signin'} onClose={() => clearAuthRequest()} />
            <SystemDesignModal open={systemDesignOpen} onClose={() => setSystemDesignOpen(false)} />
        </div>
    )
}

function DemoModeButton({ isDemoMode, onClick }: { isDemoMode: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title={isDemoMode ? "Using simulated data — click to retry the live connection" : "Force simulated demo data"}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                isDemoMode
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                    : "border-baseBorderMed text-baseTextMedEmphasis hover:border-baseBorderFocus hover:text-baseTextHighEmphasis"
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-amber-400" : "bg-baseTextMedEmphasis"}`} />
            {isDemoMode ? "Demo Mode" : "Try Demo"}
        </button>
    );
}

function SignedInMenu({ session, onSignOut }: { session: Session, onSignOut: () => void }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className="flex max-w-[160px] items-center gap-1.5 truncate rounded-lg bg-baseBackgroundL2 py-1.5 pl-1.5 pr-3 text-xs font-medium text-baseTextHighEmphasis"
                title={session.email}
            >
                <Avatar session={session} />
                <span className="truncate">{session.name ?? session.email}</span>
            </span>
            <button
                onClick={onSignOut}
                className="h-9 rounded-lg border border-baseBorderMed px-3 text-sm font-semibold text-baseTextHighEmphasis transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2 active:scale-95"
            >
                Sign out
            </button>
        </div>
    );
}

function Avatar({ session }: { session: Session }) {
    const [errored, setErrored] = useState(false);
    const initial = (session.name ?? session.email).charAt(0).toUpperCase();

    if (!session.picture || errored) {
        return (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accentBlue to-greenText text-[10px] font-semibold text-white">
                {initial}
            </span>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={session.picture}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 rounded-full"
            onError={() => setErrored(true)}
        />
    );
}
