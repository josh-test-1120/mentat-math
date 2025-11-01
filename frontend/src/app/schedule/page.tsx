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