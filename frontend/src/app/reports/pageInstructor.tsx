"use client";

import { useState, useEffect } from "react";
import { useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";

import { getServerAuthSession } from "@/utils/auth";
import { apiHandler } from "@/utils/api";
import {useSession} from "next-auth/react";
import StudentExamSummary from "./localComponents/StudentExamSummary";
import { FileText, Users } from "lucide-react";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Instructor Report Page
 * @constructor
 */
export default function InstructorReport() {
    // These are the session state variables
    const { data: session, status } = useSession();
    // Session user information
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: '',
        accessToken: '',
    });
    // State information
    const [windowReady, setWindowReady] = useState(true);
    const [testTable, setTestTable] = useState();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    // Refresh trigger tracker
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Table Body React Reference
    const tableBody = useRef(null);
    const [viewMode, setViewMode] = useState<'grades' | 'summary'>('grades');

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    /**
     * useAffects for session hydration
     */
    // General effect: Initial session hydration
    useEffect(() => {
        let id = '';
        if (status !== 'authenticated' || !session || hasFetched.current) return;
        // Hydrate session information
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || '',
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]);

    /**
     * Used to handle actions once session is ready
     */
    useEffect(() => {
        // Exit if session not ready
        if (!sessionReady) return;
        // Wrapper for async function
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                await fetchInstructorReport(1);
                // avgScore(grades);
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
            finally {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        fetchData();
    }, [sessionReady, userSession.id, hasFetched, refreshTrigger]);

    /**
     * Fetch the Instructor report based on the course ID
     * @param corID string of the course ID
     */
    async function fetchInstructorReport(corID: any) {
        console.log("Report API Data Fetch function");
        // const url = new URL('http://localhost:8080/api/instructorReportString1');
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/instructorReportString1?corID=${corID}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );
            // url.searchParams.append('corID',corID);

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching reports:', res.error);
                setTestTable(undefined);
            } else {
                console.log('Fetched data for instructor report.');
                console.log(res);
                // fetch plain text instead of JSON
                const text = await res.text();

                // split text into an array of words
                const words = text.trim().split(/\s+/);

                // slice each part of the text by 6 columns
                const tuples = [];
                for (let i = 0; i < words.length; i += 6) {
                    tuples.push(words.slice(i, i + 6));
                }

                const tableBody = document?.getElementById('instructorExamResultsTable')?.getElementsByTagName('tbody')[0];
                console.log(tuples);

                // clears the table before adding new rows
                if (tableBody != undefined) tableBody.innerHTML = '';

                // Loop through each tuple and populate the table
                tuples.forEach(tuple => {
                    let row = tableBody?.insertRow();
                    if (row != undefined) row.classList.add("hover:bg-gray-500");

                    let cellFName = row?.insertCell(0);
                    if (cellFName != undefined) {
                        cellFName.textContent = tuple[0];
                        cellFName.classList.add("border");
                        cellFName.classList.add("border-white");
                        cellFName.classList.add("text-center");
                    }

                    let cellLName = row?.insertCell(1);
                    if (cellLName != undefined) {
                        cellLName.textContent = tuple[1];
                        cellLName.classList.add("border");
                        cellLName.classList.add("border-white");
                        cellLName.classList.add("text-center");
                    }

                    let cellExamName = row?.insertCell(2);
                    if (cellExamName != undefined) {
                        cellExamName.textContent = tuple[2];
                        cellExamName.classList.add("border");
                        cellExamName.classList.add("border-white");
                        cellExamName.classList.add("text-center");
                    }

                    let cellDate = row?.insertCell(3);
                    if (cellDate != undefined) {
                        cellDate.textContent = tuple[3];
                        cellDate.classList.add("border");
                        cellDate.classList.add("border-white");
                        cellDate.classList.add("text-center");
                    }

                    let cellVersion = row?.insertCell(4);
                    if (cellVersion != undefined) {
                        cellVersion.textContent = tuple[4];
                        cellVersion.classList.add("border");
                        cellVersion.classList.add("border-white");
                        cellVersion.classList.add("text-center");
                    }

                    let cellScore = row?.insertCell(5);
                    if (cellScore != undefined) {
                        cellScore.textContent = tuple[5];
                        cellScore.classList.add("border");
                        cellScore.classList.add("border-white");
                        cellScore.classList.add("text-center");
                    }
                });


                // Convert object to array
                let examsData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    examsData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    examsData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    examsData = [];
                }

                // Filter out invalid entries
                examsData = examsData.filter(c => c && typeof c === 'object');

                console.log('Processed report data:', examsData);
                // Set courses to coursesData
                setReports(examsData);
                // setFilter('all');
                // console.log('Length of filter:', filteredExams.length);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching reports:', e);
            // Set courses to empty array
            setReports([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    }

    /**
     * Window On Load function for UseEffects handler
     */
    function windowOnload() {
        console.log(`This is the session info:`);
        console.log(userSession);
        fetchInstructorReport(1);
    }

    return (
        <section
            id={"gradePage"}
            className="text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700"
        >
            {null /*custom window onload*/}
            {null /*{windowReady ? (windowOnload()) : (<></>)}*/}
            {null /*custom session onload*/}
            {void (sessionReady ? windowOnload() : <></>)}

            <div className="mx-auto px-4 min-h-screen bg-mentat-black">
                {/* View Mode Toggle */}
                <div className="flex justify-center mb-6 -mt-4">
                    <div className="inline-flex bg-white/5 border border-mentat-gold/20 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grades')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                                viewMode === 'grades'
                                    ? 'bg-crimson text-mentat-gold'
                                    : 'text-mentat-gold/70 hover:text-mentat-gold'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Student Grades
                        </button>
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                                viewMode === 'summary'
                                    ? 'bg-crimson text-mentat-gold'
                                    : 'text-mentat-gold/70 hover:text-mentat-gold'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Exam Summary
                        </button>
                    </div>
                </div>

                {/* Content based on view mode */}
                {viewMode === 'grades' ? (
                    <div>
                        <h1 className="text-center text-3xl pb-2 text-mentat-gold">Student Exam Results</h1>
                        <table id="instructorExamResultsTable"
                               className="w-full mb-5 border border-white"
                        >
                            <thead>
                            <tr>
                                <th className="border border-white">Student First Name</th>
                                <th className="border border-white">Student Last Name</th>
                                <th className="border border-white">Exam Name</th>
                                <th className="border border-white">Exam Version</th>
                                <th className="border border-white">Exam Taken Date</th>
                                <th className="border border-white">Exam Score</th>
                            </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <StudentExamSummary />
                    </div>
                )}
            </div>
        </section>
    );
}