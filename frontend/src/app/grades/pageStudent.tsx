"use client";

import React, { useState, useEffect } from "react";
import { useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react'

import { apiHandler } from "@/utils/api";
import { toast, ToastContainer } from "react-toastify";
import { ExamProp } from "@/components/types/exams";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Default
 * @constructor
 */
export default function Grades() {

    // State information
    const [windowReady, setWindowReady] = useState(true);
    const [sessionReady, setSessionReady] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [gradeTable, setGradeTable] = useState();
    const [exams, setExams] = useState([]);
    const [tests, setTests] = useState([]);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    // Session information
    const { data: session, status } = useSession()

    // Table Body React Reference
    const tableBody = useRef(null);

    /**
     * Used to handle session hydration
     */
    useEffect(() => {
        console.log(`This is the session ready state: ${sessionReady}`)
        // If not authenticated, return
        if (status !== 'authenticated') return;

        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            // setSessionReady(prev => prev || userSession.id !== "");
            if (userSession.id != "") { setSessionReady(true); }
        }
        // Wrapper for async function
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                await fetchExams();
            } catch (error) {
                console.error('Error fetching Exams:', error);
            }
            finally {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        fetchData();
    }, [session, status, hasFetched, refreshTrigger]);

    /**
     * Fetch Exams
     * Implementation for general API handler
     */
    async function fetchExams() {
        console.log('Exam Fetch for student grades page');
        setIsLoading(true);
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/grades/${session?.user?.id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
                setExams([]);
                setTests([]);
            } else {
                // Assuming your API returns both exams and tests
                // Adjust this based on your actual API response structure
                setExams(res.exams || res); // Use res.exams if nested, or res directly
                setTests(res.tests || []); // Add logic for tests if needed
            }
        } catch (error) {
            console.error('Error fetching student exams:', error.toString());
            setExams([]);
            setTests([]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section
            id={"gradeComponentPage"}
            className="font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
        >
            <div className="mx-auto px-4 h-dvh bg-mentat-black">
                {/* Exams Table */}
                <h1 className="text-center text-2xl mb-3">See Grades</h1>
                <table className="w-full mb-5 border border-white">
                    <thead>
                    <tr className="bg-gray-700">
                        <th className="border border-white p-2">Exam Name</th>
                        <th className="border border-white p-2">Exam Version</th>
                        <th className="border border-white p-2">Exam Date</th>
                        <th className="border border-white p-2">Exam Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4">
                                Loading exams...
                            </td>
                        </tr>
                    ) : exams.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4">
                                No exams found
                            </td>
                        </tr>
                    ) : (
                        exams.map((exam : ExamProp) => (
                            <tr
                                key={`${exam.exam_id}-${exam.exam_version}`}
                                className="hover:bg-gray-500"
                            >
                                <td className="border border-white text-center p-2">
                                    {exam.exam_name}
                                </td>
                                <td className="border border-white text-center p-2">
                                    {exam.exam_version}
                                </td>
                                <td className="border border-white text-center p-2">
                                    {exam.exam_taken_date}
                                </td>
                                <td className="border border-white text-center p-2">
                                    {exam.exam_score}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/*/!* Tests Table *!/*/}
                {/*<h1 className="text-center text-2xl mb-3">See Tests</h1>*/}
                {/*<table className="w-full mb-5 border border-white">*/}
                {/*    <thead>*/}
                {/*    <tr className="bg-gray-700">*/}
                {/*        <th className="border border-white p-2">Exam Name</th>*/}
                {/*        <th className="border border-white p-2">Exam Difficulty</th>*/}
                {/*        <th className="border border-white p-2">Required Y/N</th>*/}
                {/*    </tr>*/}
                {/*    </thead>*/}
                {/*    <tbody>*/}
                {/*    {isLoading ? (*/}
                {/*        <tr>*/}
                {/*            <td colSpan={3} className="text-center p-4">*/}
                {/*                Loading tests...*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*    ) : tests.length === 0 ? (*/}
                {/*        <tr>*/}
                {/*            <td colSpan={3} className="text-center p-4">*/}
                {/*                No tests found*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*    ) : (*/}
                {/*        tests.map((test) => (*/}
                {/*            <tr*/}
                {/*                key={`${test.exam_id}-${test.exam_difficulty}`}*/}
                {/*                className="hover:bg-gray-500"*/}
                {/*            >*/}
                {/*                <td className="border border-white text-center p-2">*/}
                {/*                    {test.exam_name}*/}
                {/*                </td>*/}
                {/*                <td className="border border-white text-center p-2">*/}
                {/*                    {test.exam_difficulty}*/}
                {/*                </td>*/}
                {/*                <td className="border border-white text-center p-2">*/}
                {/*                    {test.exam_required ? 'Yes' : 'No'}*/}
                {/*                </td>*/}
                {/*            </tr>*/}
                {/*        ))*/}
                {/*    )}*/}
                {/*    </tbody>*/}
                {/*</table>*/}
            </div>
        </section>
    );
}

