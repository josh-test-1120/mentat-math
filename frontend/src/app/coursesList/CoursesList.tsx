 "use client";

import { useEffect, useState } from "react";
import {useSession} from "next-auth/react";
import {apiHandler} from "@/utils/api";

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

    // Session Information
    const { data: session, status } = useSession();

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    useEffect(() => {
        // Fetch courses from backend
        if (status !== "authenticated") return;

        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            if (userSession.id != "") { setSessionReady(true); }
            console.log("User session NAME: " + session.user.username)
        }

        const res =
            apiHandler(
            null,
            "GET",
            `course/listCourses?id=${userSession.id}`,
            `${process.env.NEXT_PUBLIC_BACKEND_API}`,
            session?.user?.accessToken || undefined
            )
                .then((data) => {
                    // Check if 'result' key exists and filter it out
                    const filteredData = Object.keys(data).reduce((acc: Record<string, any>, key) => {
                        if (key !== 'result') {
                            // Add all other keys except 'result'
                            acc[key] = data[key];
                        }
                        return acc;
                    }, {});
                    // Convert the filtered data into an array of courses
                    const coursesArray: Course[] = Object.keys(filteredData)
                        // Extract all course objects by key
                        .map((key) => filteredData[key])
                        // Remove any undefined/null values, if any
                        .filter(Boolean);

                    setCourses(coursesArray);
                })
            .catch((err) => console.error("Error fetching courses:", err));
    }, [session]);

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