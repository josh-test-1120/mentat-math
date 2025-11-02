 "use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";

export default function CourseList() {
    interface Course {
        courseName: string;
        courseID: number;
        courseSection: string;
        courseYear: number;
        courseQuarter: string;
        courseProfessorId: string;
    }
    const [courses, setCourses] = useState<Course[]>([]);

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

    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * useAffects that bind the page to refreshes and updates
     */
    // General effect: Initial session hydration
    useEffect(() => {
        let id = '';
        if (status !== 'authenticated' || !session) return;
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

    // Data load effect: Initial data hydration (after session hydration)
    useEffect(() => {
        // Exit if session not ready
        if (!sessionReady) return;
        // Otherwise, hydration the data
        const fetchData = async () => {
            // Try - Catch handler
            try {
                // Fetch the list of courses
                await fetchCourses();
            } catch (error) {
                console.error('Error fetching list of courses:', error);
            }
        };
        // Run the async handler to fetch data
        fetchData();
    }, [sessionReady, userSession.id]);

    // useEffect(() => {
    //     // Fetch courses from backend
    //     if (status !== "authenticated") return;
    //
    //     if (session) {
    //         setSession(() => ({
    //             id: session?.user.id?.toString() || '',
    //             username: session?.user.username || '',
    //             email: session?.user.email || ''
    //         }));
    //         if (userSession.id != "") { setSessionReady(true); }
    //         console.log("User session NAME: " + session.user.username)
    //     }
    //
    //     const res =
    //         apiHandler(
    //         null,
    //         "GET",
    //         `api/course/listCourses?id=${userSession.id}`,
    //         `${process.env.NEXT_PUBLIC_BACKEND_API}`,
    //         session?.user?.accessToken || undefined
    //         )
    //             .then((data) => {
    //                 // Check if 'result' key exists and filter it out
    //                 const filteredData = Object.keys(data).reduce((acc: Record<string, any>, key) => {
    //                     if (key !== 'result') {
    //                         // Add all other keys except 'result'
    //                         acc[key] = data[key];
    //                     }
    //                     return acc;
    //                 }, {});
    //                 // Convert the filtered data into an array of courses
    //                 const coursesArray: Course[] = Object.keys(filteredData)
    //                     // Extract all course objects by key
    //                     .map((key) => filteredData[key])
    //                     // Remove any undefined/null values, if any
    //                     .filter(Boolean);
    //
    //                 setCourses(coursesArray);
    //             })
    //         .catch((err) => console.error("Error fetching courses:", err));
    // }, [session]);

    /**
     * This will fetch all the Grades (Exam Results) from the database
     * @param id
     */
    const fetchCourses = async () => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/course/listCourses?id=${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
            } else {
                // Get the response data
                let coursesData = res?.courses || res || []; // Once grabbed, it is gone
                // Ensure it's an array
                coursesData = Array.isArray(coursesData) ? coursesData : [coursesData];
                // Filter out the empty rows
                coursesData = coursesData
                    .map((key: string | number) => coursesData[key])
                    // Remove any undefined/null values, if any
                    .filter(Boolean);
                console.log('Processed courses data:', coursesData);
                // Set courses to coursesData
                setCourses(coursesData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching courses:', e);
        }
    };

    console.log("LIST SIZE" + courses.length);
    for (let i = 0; i < courses.length; i++) {
        console.log("COURSENAME" + courses[i].courseName);
    }

    return (
        <section className="max-w-2xl mx-auto p-6 bg-zinc-900 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center underline">Your Created Courses</h2>

            {courses.length === 0 ? (
                <p className="text-center text-gray-400">No courses available.</p>
            ) : (
                <div className="space-y-4">
                    {courses.map((course, index) => (
                        <div key={index} className="p-4 bg-zinc-800 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">{course.courseName}</h3>
                                <p className="text-gray-400">
                                    Section {course.courseSection} - {course.courseYear} {course.courseQuarter} -
                                    Course ID: {course.courseID}
                                </p>
                            </div>
                            <button className="bg-red-700 hover:bg-red-600 text-mentat-gold px-3 py-1 rounded">
                                View
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}