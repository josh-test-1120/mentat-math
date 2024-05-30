//"use client";
import type { Metadata } from "next";
import Link from "next/link";

import Script from "next/script";
import { getServerAuthSession } from "@/utils/auth";

import "../styles/Grades.module.css"
// @ts-ignore
import {useEffect, useState} from "react";


async function fetchInstructorReport(corID: any) {
    try {
        console.log("FOOBAR");
        const url = new URL('http://localhost:8080/api/instructorReportString1');
        url.searchParams.append('corID',corID);

        const response = await fetch(url);

        // fetch plain text instead of JSON
        const text = await response.text();

        // split text into an array of words
        const words = text.trim().split(/\s+/);

        // slice each part of the text by 6 columns
        const tuples = [];
        for (let i = 0; i < words.length; i += 6) {
            tuples.push(words.slice(i, i + 6));
        }

        const tableBody = document.getElementById('instructorExamResultsTable').getElementsByTagName('tbody')[0];
        console.log(tuples);

        // clears the table before adding new rows
        tableBody.innerHTML = '';

        // Loop through each tuple and populate the table
        tuples.forEach(tuple => {
            let row = tableBody.insertRow();

            let cellFName = row.insertCell(0);
            cellFName.textContent = tuple[0];

            let cellLName = row.insertCell(1);
            cellLName.textContent = tuple[1];

            let cellExamName = row.insertCell(2);
            cellExamName.textContent = tuple[2];

            let cellDate = row.insertCell(3);
            cellDate.textContent = tuple[3];

            let cellVersion = row.insertCell(4);
            cellVersion.textContent = tuple[4];

            let cellScore = row.insertCell(5);
            cellScore.textContent = tuple[5];
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
    }
}

function windowOnLoad() {
    fetchInstructorReport(1);
}
export default async function InstructorReport() {

    const session = await getServerAuthSession();
    const [windowReady, setWindowReady] = useState(true);

    useEffect(() => {
        if (document.readyState !== 'complete') {
            const handler = () => {
                console.log('load');
                setWindowReady(false);
            };
            window.addEventListener('load', handler);

            return () => {
                window.removeEventListener('load', handler);
            };
        } else {
            const timeout = window.setTimeout(() => {
                console.log('timeout');
                setWindowReady(false);
            }, 0);
            return () => window.clearTimeout(timeout);
        }
    }, []);

    return (
        <section
            id={"gradePage"}
            className="text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700"
        >
            {/*custom window onload*/}
            {windowReady ? (windowOnLoad()) : (<></>)}
            <style>

            </style>

            <script></script>
            <div className="mx-auto px-4 pt-32 h-dvh">
                <h1 className="text-center text-3xl pb-2">See Student Grades</h1>
                <table id="instructorExamResultsTable"
                       className="w-full border-collapse mb-5 border-4"
                >
                    <thead className="border-4">
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Student First Name</th>
                        <th className="border border-white">Student Last Name</th>
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Version</th>
                        <th className="border border-white">Exam Taken Date</th>
                        <th className="border border-white">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody className="border-4">

                    </tbody>
                </table>
            </div>
        </section>
    );
}
