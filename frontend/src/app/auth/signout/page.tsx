'use client';

import { useEffect, useState } from 'react';
import { getCsrfToken } from 'next-auth/react';
import { signOut } from "next-auth/react";

export default function SignOut() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [csrfToken, setCsrfToken] = useState<string>('');

    useEffect(() => {
        // Get CSRF token on client side
        getCsrfToken().then(token => {
            if (token) setCsrfToken(token);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        setIsSubmitting(true);
        // Form will auto-submit to /api/auth/signout
    };

    if (!csrfToken) {
        return (
            <div className="min-h-screen bg-mentat-black flex items-center justify-center p-4">
                <div className="text-mentat-gold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mentat-black flex items-center justify-center p-4">
            <div className="bg-card-color p-8 rounded-lg shadow-lg max-w-md w-full border border-mentat-gold/20">
                <h1 className="text-2xl font-bold text-mentat-gold mb-4 text-center">Sign Out</h1>
                <p className="text-gray-300 mb-6 text-center">Are you sure you want to sign out?</p>

                <form
                    method="post"
                    action="/api/auth/signout"
                    onSubmit={handleSubmit}
                >
                    <input type="hidden" name="csrfToken" value={csrfToken} />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-crimson text-mentat-gold py-3 px-4 rounded-lg hover:bg-crimson-700 transition-colors shadow-sm shadow-mentat-gold-700 font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a
                        href="/"
                        className="text-gray-400 hover:text-mentat-gold transition-colors text-sm"
                    >
                        Cancel and return to site
                    </a>
                </div>
            </div>
        </div>
    );
}