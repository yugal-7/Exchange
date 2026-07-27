'use client'
import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID, decodeGoogleCredential, loadGoogleScript } from "../utils/googleAuth";
import { signIn } from "../utils/session";
import { showToast } from "../utils/toast";

const DEMO_PROFILE = { email: "demo.user@gmail.com", name: "Demo Google User" };

export function GoogleSignInButton({ onDone }: { onDone: () => void }) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const clientId = GOOGLE_CLIENT_ID;
        if (!clientId) return;
        let cancelled = false;

        loadGoogleScript()
            .then(() => {
                if (cancelled || !window.google || !buttonRef.current) return;
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        const profile = decodeGoogleCredential(response.credential);
                        if (!profile) {
                            showToast("Could not read Google account details", "error");
                            return;
                        }
                        signIn({ email: profile.email, name: profile.name, picture: profile.picture, provider: "google" });
                        showToast(`Signed in as ${profile.name ?? profile.email}`, "success");
                        onDone();
                    },
                });
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "filled_black",
                    size: "large",
                    width: 320,
                    text: "continue_with",
                });
                setReady(true);
            })
            .catch(() => setFailed(true));

        return () => {
            cancelled = true;
        };
    }, [onDone]);

    const signInWithDemoGoogle = () => {
        signIn({ ...DEMO_PROFILE, provider: "google" });
        showToast("Signed in with Google (demo — no Client ID configured)", "success");
        onDone();
    };

    if (GOOGLE_CLIENT_ID && !failed) {
        return (
            <div className="flex min-h-[44px] items-center justify-center">
                {!ready && <span className="text-xs text-baseTextMedEmphasis">Loading Google Sign-In…</span>}
                <div ref={buttonRef} />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={signInWithDemoGoogle}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-baseBorderLight bg-white text-sm font-medium text-gray-800 transition hover:bg-gray-100 active:scale-[0.98] sm:h-10"
        >
            <GoogleLogo />
            Continue with Google
        </button>
    );
}

function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
        </svg>
    );
}
