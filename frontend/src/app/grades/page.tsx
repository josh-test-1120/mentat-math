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
                <h1 className="">See Grades</h1>
                <table id="examResultsTable"
                       className="w-full border-collapse mb-5"
                >
                    <thead>
                    <tr>
                        <th>Exam Taken Date</th>
                        <th>Exam Name</th>
                        <th>Exam Version</th>
                        <th>Exam Score</th>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
                <h1>See Tests</h1>
                <table id="testsTable"
                       className="w-full border-collapse mb-5"
                >
                    <thead>
                    <tr>
                        <th>Exam Name</th>
                        <th>Exam Difficulty</th>
                        <th>Required Y/N</th>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </div>
        </section>
    );
}

