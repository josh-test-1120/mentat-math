import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { getServerAuthSession } from "@/utils/auth";
import { apiHandler } from "@/utils/api";
import GradesPage from "./pageClient";
import { toast, ToastContainer } from "react-toastify";
import { AuthProvider } from "@/components/authProvider"

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default async function Grades() {

    const session =  await getServerAuthSession();

    return (

        <AuthProvider session={session}>
            <section
                id={"gradePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <GradesPage/>
            </section>
        </AuthProvider>

    );

}

