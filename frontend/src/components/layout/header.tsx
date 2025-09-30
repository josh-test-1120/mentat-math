import Link from "next/link";
import { SignOutButton } from "./ClientLayout";
import { getServerAuthSession } from "@/utils/auth";
import Image from "next/image";
import logoPic from "@/public/icon-logo.png";
import {ArtisticText, FadeUpText, TypewriterText} from "@/components/UI/Animators";

/**
 * Default Header used in default Layout
 * @constructor
 */
export default async function Header() {
    const session = await getServerAuthSession();
    const animateTextDelay = 0.1;

    return (
        <header className="flex justify-between items-center bg-gradient-to-r from-crimson via-zinc-900 to-neutral-950 py-3 px-6 border-b-4 border-stone-400">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden">
                    <Image
                        src={logoPic}
                        alt="The Mentats Logo"
                        fill
                        className="object-contain"
                        priority={true}
                    />
                </div>
                <div className="text-mentat-gold">
                    <div className="text-lg font-bold">The Mentats</div>
                    <div className="text-sm">PROGRAMMING</div>
                </div>
            </div>
            {/* Application Title Animation */}
            <div className="text-mentat-gold text-3xl italic">
                <TypewriterText text="Math Scheduler Tool" delay={animateTextDelay}/>
                {/*<ArtisticText text="Math Scheduler Tool" />*/}
                {/*<FadeUpText text="Math Scheduler Tool" />*/}
            </div>
                
            <div className="flex items-center space-x-2">
                {session ? (
                    <>
                        <Link href="/dashboard" className="text-mentat-gold bg-crimson hover:bg-crimson-700 py-2 px-4 rounded-xl">
                            Dashboard
                        </Link>
                        <SignOutButton/>
                    </>
                ) : (
                    <>
                        <Link href="/auth/signin" className="text-mentat-gold bg-crimson hover:bg-crimson-700 py-2 px-4 rounded-xl">
                            Log in
                        </Link>
                        <Link href="/auth/signup" className="text-mentat-gold bg-crimson hover:bg-crimson-700 py-2 px-4 rounded-xl">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}