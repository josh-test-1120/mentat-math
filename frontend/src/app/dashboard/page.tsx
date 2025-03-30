import type { Metadata } from "next";
import Link from "next/link";
import { getServerAuthSession } from "@/utils/auth";
import CreateCourse from "@/app/courses/CreateCourse";
import {AuthProvider} from "@/components/authProvider";
import JoinCourse from "@/app/courses/JoinCourse";

/**
 * Default Dashboard Page
 * @constructor
 */
export default async function Dashboard() {
    const session = await getServerAuthSession();

    return (
        <AuthProvider session={session}>
            <div className="min-h-screen overflow-auto h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold">
                <div>
                    <h1 className="text-3xl font-bold">EZMath Dashboard</h1>
                </div>

                <p className="mt-2 mb-6">
                    Welcome to EZMath Quiz Scheduler!
                </p>
                <JoinCourse/>
            </div>
        </AuthProvider>
    );
}