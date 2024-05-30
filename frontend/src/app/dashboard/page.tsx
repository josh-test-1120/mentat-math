import type { Metadata } from "next";
import Link from "next/link";
import { getServerAuthSession } from "@/utils/auth";

export default async function Dashboard() {
    const session = await getServerAuthSession();
    const currDate = new Date().toLocaleDateString(); //variable for current date
    const currTime = new Date().toLocaleTimeString(); //variable for current time
    // Add error handling for failed authentication

    console.log(session);

    return (
        <div className="conatainer h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold">
        {/*<div className="container mx-auto max-w-md px-4 py-8 bg-mentat-black ">*/}
            <div>
                <h1 className="text-3xl font-bold">EZMath Dashboard</h1>
            </div>
            
            <p className="mt-2 mb-4">
                Welcome to EZMath Quiz Scheduler!
            </p>
        </div>
    );
}