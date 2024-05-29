"use client";
import type { Metadata } from "next";
import Link from "next/link";

import Script from "next/script";

import { getServerAuthSession } from "@/utils/auth";

import { fetchExams, fetchReport } from "./grades";

import { useState, useEffect } from "react";


async function fetchExams() {
    try {
        const response = await fetch('http://localhost:8080/api/grades'); //tries to send GET request to specified API endpoint

        const data = await response.json(); //parse data as json and await response

        const tableBody = document.getElementById('testsTable').getElementsByTagName('tbody')[0];


        //loops through each exam item
        data.forEach(exam => {
            let row = tableBody.insertRow();

            let cellName = row.insertCell(0);
            cellName.textContent = exam.exam_name;

            let cellDifficulty = row.insertCell(1);
            cellDifficulty.textContent = exam.exam_difficulty;

            let cellRequired = row.insertCell(2);
            cellRequired.textContent = exam.is_required ? 'Yes' : 'No';
        });

    } catch (error) {
        console.error('Error fetching exams:', error);
    }
}
//TELMEN's CODE
async function fetchReport() {
    try {
        console.log("BACKUP!");
        const response = await fetch('http://localhost:8080/api/studentReportString1');

        // fetch plain text instead of JSON
        const text = await response.text();

        // split text into an array of words
        const words = text.trim().split(/\s+/);

        // slice each part of the text by 4 columns
        const tuples = [];
        for (let i = 0; i < words.length; i += 4) {
            tuples.push(words.slice(i, i + 4));
        }

        const tableBody = document.getElementById('examResultsTable').getElementsByTagName('tbody')[0];
        console.log(tuples);

        // clears the table before adding new rows
        tableBody.innerHTML = '';

        // Loop through each tuple and populate the table
        tuples.forEach(tuple => {
            let row = tableBody.insertRow();

            let cellDate = row.insertCell(0);
            cellDate.textContent = tuple[0];

            let cellName = row.insertCell(1);
            cellName.textContent = tuple[1];

            let cellVersion = row.insertCell(2);
            cellVersion.textContent = tuple[2];

            let cellScore = row.insertCell(3);
            cellScore.textContent = tuple[3];
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
    }
}

function windowOnload() {
    // Fetch the exams when the page loads
    //window.onload = fetchExams;
    window.onload = fetchReport;
}



export default async function Grades() {
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
            className="text-amber-400 font-bold "
        >

            {/*custom window onload*/}
            {windowReady ? (windowOnload()) : (<></>)}

            <Script id={"grades-script"}>
            </Script>

            <div className="mx-auto px-4 pt-32 h-dvh">
                <h1 className="">See Grades</h1>
                <table id="examResultsTable"
                       className="w-full mb-5 border border-gray-900"
                >
                    <thead>
                    <tr>
                        <th className="border border-gray-900">Exam Taken Date</th>
                        <th className="border border-gray-900">Exam Name</th>
                        <th className="border border-gray-900">Exam Version</th>
                        <th className="border border-gray-900">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
                <h1>See Tests</h1>
                <table id="testsTable"
                       className="w-full border-collapse mb-5 border-4"
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

