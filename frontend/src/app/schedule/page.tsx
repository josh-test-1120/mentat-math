'use client';

import { useSession } from "next-auth/react";
import InstructorsPage from "./pageInstructor";
import StudentsPage from "./pageStudent";
import { useEffect } from "react";

/**
 * Client Side Page that uses the AuthProvider session from RootLayout
 * @constructor
 */
export default function Schedule() {
    const { data: session, status } = useSession();

    // Debug logging in useEffect to avoid hydration issues
    useEffect(() => {
        console.log("Schedule page - Session data:", JSON.stringify(session, null, 2));
        console.log("Schedule page - User type:", session?.user?.userType);
        console.log("Schedule page - User ID:", session?.user?.id);
        console.log("Schedule page - Access Token:", session?.user?.accessToken ? 'Present' : 'Missing');
        console.log("Schedule page - Access Token length:", session?.user?.accessToken?.length || 0);
    }, [session, status]);

    return (
        <section
            id={"schedulePageMain"}
            className="h-full font-bold bg-mentat-black text-mentat-gold"
        >
            {status === "loading" ? (
                <div>Loading...</div>
            ) : !session ? (
                <div>Please log in to access this page</div>
            ) : session?.user?.userType === "Instructor" ?
                (<InstructorsPage />) : (<StudentsPage />)
            }
        </section>
    );
}