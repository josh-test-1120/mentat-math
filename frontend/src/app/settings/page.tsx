'use client';

import { useSession } from "next-auth/react";
import SettingsClient from "./pageClient";

/**
 * Settings Page - Server Component Wrapper
 * @constructor
 */
export default function Settings() {
    return (
        <section
            id={"settingsPageMain"}
            className="font-bold h-full max-w-screen-2xl bg-mentat-black text-mentat-gold"
        >
            <SettingsClient />
        </section>
    );
}

