'use client';

import { useSession } from "next-auth/react";
import InstructorsPage from "./pageInstructor";
import StudentsPage from "./pageStudent";

/**
 * Client Side Page that uses the AuthProvider session from RootLayout
 * @constructor
 */
export default function Grades() {
    const { data: session, status } = useSession();

    return (
        <section
            id={"gradePageMain"}
            className="font-bold h-full max-w-screen-2xl bg-mentat-black text-mentat-gold"
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