import type { Metadata } from "next";
import Link from "next/link";

import Script from "next/script";

import { getServerAuthSession } from "@/utils/auth";

import "../styles/Grades.module.css"
export default async function Grades() {
    const session = await getServerAuthSession();

    return (
        <section
            id={"gradePage"}
            className="text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700"
        >
            <style>

            </style>
            <Script
                src="./grades.js"
            />
            <div className="mx-auto px-4 pt-32 h-dvh">
                <h1 className="text-center text-3xl pb-2">See Grades</h1>
                <table id="examResultsTable"
                       className="w-full border-collapse mb-5 border-4"
                >
                    <thead className="border-4">
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Exam Taken Date</th>
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Version</th>
                        <th className="border border-white">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody className="border-4">

                    </tbody>
                </table>
                <h1 className="text-center text-3xl pb-2">See Tests</h1>
                <table id="testsTable"
                       className="w-full border-collapse mb-5 border-4"
                >
                    <thead>
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Difficulty</th>
                        <th className="border border-white">Required Y/N</th>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </div>
        </section>
    );
}

