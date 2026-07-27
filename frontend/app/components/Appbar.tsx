'use client'

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter, usePathname } from "next/navigation"
import { useDemoMode, setForcedDemoMode } from "../utils/demoMode"
import { useSession, signOut } from "../utils/session"
import { showToast } from "../utils/toast"
import { requestAuth, clearAuthRequest, useAuthModalRequest } from "../utils/authModalRequest"
import { AuthModal } from "./AuthModal"

const NAV_LINKS = [
    { label: "Markets", href: "/markets" },
    { label: "Trade", href: "/trade/SOL_USDC" },
];

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter();
    const isDemoMode = useDemoMode();
    const session = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
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
        <div className="sticky top-0 z-50 -mx-2 mb-2 border-b border-baseBorderLight bg-baseBackgroundL0/80 px-2 backdrop-blur supports-[backdrop-filter]:bg-baseBackgroundL0/60">
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        className="flex items-center gap-2 text-lg font-bold tracking-tight text-baseTextHighEmphasis"
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
                        <SignedInMenu email={session.email} onSignOut={handleSignOut} />
                    ) : (
                        <>
                            <PrimaryButton onClick={() => requestAuth('signup')}>Sign up</PrimaryButton>
                            <SuccessButton onClick={() => requestAuth('signin')}>Sign in</SuccessButton>
                        </>
                    )}
                </div>

                <button
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-baseTextHighEmphasis md:hidden"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {menuOpen && (
                <div className="flex flex-col gap-1 border-t border-baseBorderLight py-3 md:hidden">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.href}
                            onClick={() => goto(link.href)}
                            className="rounded-md px-3 py-2 text-left text-sm font-medium text-baseTextMedEmphasis transition hover:bg-baseBackgroundL1 hover:text-baseTextHighEmphasis"
                        >
                            {link.label}
                        </button>
                    ))}
                    <div className="px-3 py-2">
                        <DemoModeButton isDemoMode={isDemoMode} onClick={toggleDemoMode} />
                    </div>
                    <div className="flex flex-col gap-2 px-3 pt-1">
                        {session ? (
                            <button
                                onClick={handleSignOut}
                                className="h-9 rounded-lg border border-baseBorderMed text-sm font-semibold text-baseTextHighEmphasis transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2"
                            >
                                Sign out ({session.email})
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
        </div>
    )
}

function DemoModeButton({ isDemoMode, onClick }: { isDemoMode: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title={isDemoMode ? "Using simulated data — click to retry the live connection" : "Force simulated demo data"}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
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

function SignedInMenu({ email, onSignOut }: { email: string, onSignOut: () => void }) {
    return (
        <div className="flex items-center gap-2">
            <span className="max-w-[140px] truncate rounded-lg bg-baseBackgroundL2 px-3 py-1.5 text-xs font-medium text-baseTextHighEmphasis" title={email}>
                {email}
            </span>
            <button
                onClick={onSignOut}
                className="h-9 rounded-lg border border-baseBorderMed px-3 text-sm font-semibold text-baseTextHighEmphasis transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2"
            >
                Sign out
            </button>
        </div>
    );
}
