import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";

export default function EXAMPLE() {
    return (
    <Link href="/auth/signup" className="px-4 py-2 bg-blue-500 text-white rounded">
        Sign up
    </Link>
    )
}
