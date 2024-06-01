"use client";

import { useState, useEffect } from "react";
import { useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";

import { getServerAuthSession } from "@/utils/auth";
import { apiHandler } from "@/utils/api";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Instructor Report Page
 * @constructor
 */
export default function InstructorReport() {

    // State information
    const [windowReady, setWindowReady] = useState(true);
    const [testTable, setTestTable] = useState();
    // Session Handler for SSR pages
    async function session() { await getServerAuthSession(); };

    // Table Body React Reference
    const tableBody = useRef(null);

    // Pre-flight and loading effects
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

    /**
     * Get the session of the user
     */
    async function getSession(){
        const session =  await getServerAuthSession();
        console.log("This is the session")
        console.log(session);
        if (session) return session.user;
    }

    /**
     * Fetch the Instructor report based on the course ID
     * @param corID string of the course ID
     */
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
                cellFName.classList.add("border");
                cellFName.classList.add("border-white");
                cellFName.classList.add("text-center");

                let cellLName = row.insertCell(1);
                cellLName.textContent = tuple[1];
                cellLName.classList.add("border");
                cellLName.classList.add("border-white");
                cellLName.classList.add("text-center");

                let cellExamName = row.insertCell(2);
                cellExamName.textContent = tuple[2];
                cellExamName.classList.add("border");
                cellExamName.classList.add("border-white");
                cellExamName.classList.add("text-center");

                let cellDate = row.insertCell(3);
                cellDate.textContent = tuple[3];
                cellDate.classList.add("border");
                cellDate.classList.add("border-white");
                cellDate.classList.add("text-center");

                let cellVersion = row.insertCell(4);
                cellVersion.textContent = tuple[4];
                cellVersion.classList.add("border");
                cellVersion.classList.add("border-white");
                cellVersion.classList.add("text-center");

                let cellScore = row.insertCell(5);
                cellScore.textContent = tuple[5];
                cellScore.classList.add("border");
                cellScore.classList.add("border-white");
                cellScore.classList.add("text-center");
            });

        } catch (error) {
            console.error('Error fetching exam results:', error);
        }
    }

    /**
     * Window On Load function for UseEffects handler
     */
    function windowOnload() {
        fetchInstructorReport(1);
    }

    return (
        <section
            id={"gradePage"}
            className="text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700"
        >
            {/*custom window onload*/}
            {windowReady ? (windowOnload()) : (<></>)}
            <style>

            </style>

            <script></script>
            <div className="mx-auto px-4 pt-8 h-dvh bg-mentat-black">
                <h1 className="text-center text-3xl pb-2">See Student Grades</h1>
                <table id="instructorExamResultsTable"
                       className="w-full mb-5 border border-white"
                >
                    <thead>
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Student First Name</th>
                        <th className="border border-white">Student Last Name</th>
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Version</th>
                        <th className="border border-white">Exam Taken Date</th>
                        <th className="border border-white">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody className="hover:bg-gray-500">

                    </tbody>
                </table>
            </div>
        </section>
    );
}