"use client";
import type { Metadata } from "next";
import Link from "next/link";

import Script from "next/script";

import { getServerAuthSession } from "@/utils/auth";

//import { fetchExams, fetchReport } from "./grades";

import { useState, useEffect } from "react";
import { apiHandler } from "@/utils/api";

import { toast, ToastContainer } from "react-toastify";

import { useRef } from 'react';

import userSession from "./userSession";

import dynamic from 'next/dynamic'

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default function Grades() {

    const [windowReady, setWindowReady] = useState(true);
    const [userID, setUserID] = useState();
    async function session() { await getServerAuthSession(); };

    const tableBody = useRef(null);


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

    function getSession(data){
        console.log("inside the get session");
        console.log(data);
        return data?.user?.id;

       // const session =  getSessionAsync();
       // console.log("This is the session")
       // console.log(session);
       // let id = 0;
       // let user = session.then((data) => {
       //     id = data;
       //     console.log("This is the data")
       //     console.log(data);
       // })
       //     .finally(() => { console.log("done with session grab")});
       // console.log(id);
       // //let id = user?.id;
       // return id;
    }

    function getSessionAsync(){
        const session =  getServerAuthSession();
        console.log("This is the session")
        session.then(getSession);
        // console.log(session);
        // console.log(session?.user?.id);
        // let id = session?.user?.id;
        // return id;
    }

    // Josh Test work for general API handler
    // TDB in future iteration
    // async function fetchExams() {
    //     try {
    //
    //         try {
    //             // const response = await apiHandler({},'GET',
    //             //     'api/grades/',
    //             //     `${BACKEND_API}`
    //             // );
    //             const response = await fetch('http://localhost:8080/api/grades'); //tries to send GET request to specified API endpoint
    //             // console.log('api call done');
    //             // console.log(response);
    //             // if (!response.message.includes('success')) throw Error(response.message);
    //             // const data = await response.message; //parse data as json and await response\
    //             // console.log("This is the data");
    //             // console.log(data);
    //             const data = await response.json(); //parse data as json and await response
    //
    //             const tableBody = document.getElementById('testsTable').getElementsByTagName('tbody')[0];
    //
    //
    //             //loops through each exam item
    //             data.forEach(exam => {
    //                 let row = tableBody.insertRow();
    //
    //                 let cellName = row.insertCell(0);
    //                 cellName.textContent = exam.exam_name;
    //
    //                 let cellDifficulty = row.insertCell(1);
    //                 cellDifficulty.textContent = exam.exam_difficulty;
    //
    //                 let cellRequired = row.insertCell(2);
    //                 cellRequired.textContent = exam.is_required ? 'Yes' : 'No';
    //             });
    //
    //         } catch (error) {
    //             console.error('Error fetching exams:', error.toString());
    //         }
    //
    //     }
    //     catch (error) {
    //         toast.error("Failed to create exams");
    //     }
    //
    //
    // }

    async function fetchExams() {
        try {
            const response = await fetch('http://localhost:8080/api/grades'); // Send GET request to the specified API endpoint
            const data = await response.json(); // Parse data as JSON and await response

            const tableBody = document.getElementById('testsTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear existing rows in the table body

            // Loop through each exam item
            data.forEach(exam => {
                let row = tableBody.insertRow();

                let cellName = row.insertCell(0);
                cellName.textContent = exam.exam_name;
                cellName.classList.add("border");
                cellName.classList.add("border-white");
                cellName.classList.add("text-center");

                let cellDifficulty = row.insertCell(1);
                cellDifficulty.textContent = exam.exam_difficulty;
                cellDifficulty.classList.add("border");
                cellDifficulty.classList.add("border-white");
                cellDifficulty.classList.add("text-center");

                let cellRequired = row.insertCell(2);
                cellRequired.textContent = exam.is_required ? 'Yes' : 'No';
                cellRequired.classList.add("border");
                cellRequired.classList.add("border-white");
                cellRequired.classList.add("text-center");
            });
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    }

    //TELMEN's CODE
    async function fetchReport(SID:any) {
        try {
            console.log("BACKUP!");
            //const response = await fetch('http://localhost:8080/api/studentReportString1');

            const url = new URL('http://localhost:8080/api/studentReportString1');
            url.searchParams.append('SID', SID);
            const response = await fetch(url);

            console.log(url.toString());
            // const response = await apiHandler({'id':SID},'GET',
            //     url.toString(),
            //     ``
            // );
            console.log("This is the response from exam student");
            console.log(response);
            // fetch plain text instead of JSON
            // var words = Object.keys(response).map((key) => [key, response[key]]);
            // console.log(words);

            // fetch plain text instead of JSON
            const text = await response.text();

            // split text into an array of words
            const words = text.trim().split(/\s+/);

            // slice each part of the text by 4 columns
            const tuples = [];
            for (let i = 0; i < words.length; i += 4) {
                tuples.push(words.slice(i, i + 4));
            }

            //console.log(tableBody)
            const tableBody= document.getElementById('examResultsTable').getElementsByTagName('tbody')[0];
            console.log(tuples);

            console.log(tableBody.innerHTML);
            // clears the table before adding new rows
            tableBody.innerText = '';

            // Loop through each tuple and populate the table
            tuples.forEach(tuple => {
                let row = tableBody.insertRow();

                let cellDate = row.insertCell(0);
                cellDate.textContent = tuple[0];
                cellDate.classList.add("border");
                cellDate.classList.add("border-white");
                cellDate.classList.add("text-center");

                let cellName = row.insertCell(1);
                cellName.textContent = tuple[1];
                cellName.classList.add("border");
                cellName.classList.add("border-white");
                cellName.classList.add("text-center");

                let cellVersion = row.insertCell(2);
                cellVersion.textContent = tuple[2];
                cellVersion.classList.add("border");
                cellVersion.classList.add("border-white");
                cellVersion.classList.add("text-center");

                let cellScore = row.insertCell(3);
                cellScore.textContent = tuple[3];
                cellScore.classList.add("border");
                cellScore.classList.add("border-white");
                cellScore.classList.add("text-center");
            });

        } catch (error) {
            console.error('Error fetching exam results:', error);
        }
    }

    function windowOnload() {
        // Fetch the exams when the page loads
        fetchExams();

        let testSession = getSessionAsync();


        //let userSession = getSession();
        console.log("This is the user id:");
        console.log(userID);

        fetchReport(1);
    }

    return (


        <section
            id={"gradePage"}
            className=" font-bold conatainer h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold "
        >

            {/*custom window onload*/}
            {windowReady ? (windowOnload()) : (<></>)}

            <div className="mx-auto px-4 h-dvh bg-mentat-black">
                <h1 className="text-center text-2xl mb-3">See Grades</h1>
                <table id="examResultsTable"
                       className="w-full mb-5 border border-white"
                >
                    <thead>
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Exam Taken Date</th>
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Version</th>
                        <th className="border border-white">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody className="hover:bg-gray-500">

                    </tbody>
                </table>
                <h1 className="text-center text-2xl mb-3">See Tests</h1>
                <table id="testsTable"
                       className="w-full mb-5 border border-white"
                >
                    <thead>
                    <tr className="hover:bg-gray-500">
                        <th className="border border-white">Exam Name</th>
                        <th className="border border-white">Exam Difficulty</th>
                        <th className="border border-white">Required Y/N</th>
                    </tr>
                    </thead>
                    <tbody className="hover:bg-gray-500">

                    </tbody>
                </table>
            </div>
        </section>
    );
}

