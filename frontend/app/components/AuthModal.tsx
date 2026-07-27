'use client'
import { useState } from "react";
import { Modal } from "./core/Modal";
import { signIn } from "../utils/session";
import { showToast } from "../utils/toast";

export function AuthModal({ open, mode, onClose }: { open: boolean, mode: 'signin' | 'signup', onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const close = () => {
        setEmail('');
        setPassword('');
        setError('');
        onClose();
    };

    const submit = () => {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Enter a valid email address.');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }
        signIn(email);
        showToast(mode === 'signup' ? `Demo account created for ${email}` : `Signed in as ${email}`, 'success');
        close();
    };

    return (
        <Modal open={open} onClose={close}>
            <h2 className="text-lg font-semibold text-baseTextHighEmphasis">
                {mode === 'signup' ? 'Create account' : 'Sign in'}
            </h2>
            <p className="mt-1 text-xs text-baseTextMedEmphasis">
                Demo account only — stored in this browser, no real backend involved.
            </p>
            <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); submit(); }}
            >
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border border-baseBorderLight bg-baseBackgroundL2 px-3 text-base text-baseTextHighEmphasis placeholder-baseTextMedEmphasis outline-none transition focus:border-accentBlue sm:h-10 sm:text-sm"
                />
                <input
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg border border-baseBorderLight bg-baseBackgroundL2 px-3 text-base text-baseTextHighEmphasis placeholder-baseTextMedEmphasis outline-none transition focus:border-accentBlue sm:h-10 sm:text-sm"
                />
                {error && <p className="text-xs text-redText">{error}</p>}
                <button
                    type="submit"
                    className="h-10 rounded-lg bg-greenPrimaryButtonBackground text-sm font-semibold text-greenPrimaryButtonText transition hover:opacity-90 active:scale-[0.98]"
                >
                    {mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
            </form>
        </Modal>
    );
}
