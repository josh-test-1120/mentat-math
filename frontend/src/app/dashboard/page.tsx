'use client';

import { useSession } from "next-auth/react";
import InstructorsPage from "./pageInstructor";
import StudentsPage from "./pageStudent";

/**
 * Client Side Page that uses the AuthProvider session from RootLayout
 * @constructor
 */
export default function Dashboard() {
    const { data: session, status } = useSession();

    return (
        <section
            id={"dashboardPageMain"}
            className="font-bold h-full max-w-screen-2xl px-4 pt-8 pb-2
                bg-mentat-black text-mentat-gold"
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