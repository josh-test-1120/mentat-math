'use client';

import { useSession } from "next-auth/react";
import InstructorsPage from "./pageInstructor";
import {StudentReport as StudentsPage} from "./pageStudent";

/**
 * Client Side Page that uses the AuthProvider session from RootLayout
 * @constructor
 */
export default function Report() {
    const { data: session, status } = useSession();

    return (
        <section
            id={"reportsPageMain"}
            className="font-bold h-full max-w-screen-2xl px-4 py-8
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