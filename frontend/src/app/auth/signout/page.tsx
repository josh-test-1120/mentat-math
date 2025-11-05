'use client';

import { useState } from 'react';
import { signOut } from "next-auth/react";

export default function SignOut() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignOut = async () => {
        setIsSubmitting(true);
        
        try {
            // Use NextAuth's signOut function directly
            await signOut({
                callbackUrl: '/auth/signin',
                redirect: true
            });
        } catch (error) {
            console.error('Sign out error:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-mentat-black flex items-center justify-center p-4">
            <div className="bg-card-color p-8 rounded-lg shadow-lg max-w-md w-full border border-mentat-gold/20">
                <h1 className="text-2xl font-bold text-mentat-gold mb-4 text-center">Sign Out</h1>
                <p className="text-gray-300 mb-6 text-center">Are you sure you want to sign out?</p>

                <button
                    onClick={handleSignOut}
                    disabled={isSubmitting}
                    className="w-full bg-crimson text-mentat-gold py-3 px-4 rounded-lg hover:bg-crimson-700 transition-colors shadow-sm shadow-mentat-gold-700 font-semibold disabled:opacity-50"
                >
                    {isSubmitting ? 'Signing Out...' : 'Sign Out'}
                </button>

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