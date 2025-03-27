"use client";

import {useEffect, useState} from "react";
import {apiHandler} from "@/utils/api";
import {SessionProvider, signIn, useSession} from "next-auth/react";
import {toast} from "react-toastify";


export default function CreateCourse() {

    const [formData, setFormData] = useState({
        courseName: "",
        year: 2025,
        quarter: "Fall",
        sectionNumber: "001",
    });

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const { courseName, year, quarter, sectionNumber} = formData;

    // Session
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // // Session information
    const { data: session, status } = useSession();

    console.log("Session Status:", status);
    console.log("Session Data:", session);

    // Event handler for data change
    const data = (e: any) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [e.target.name]: e.target.value
        }));
    };

    /**
     * Used to handle session hydration
     */
    useEffect(() => {
        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            if (userSession.id != "") { setSessionReady(true); }
            console.log("User session NAME: " + session.user.username)
        }
    }, [session]);

    // Logging the session info
    console.log({session})

    // Function to submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const courseData = { courseName,
            year,
            quarter,
            sectionNumber,
            username: userSession.username };
        // Session information

        console.log("Course Created:", courseData);

        // Creating Course through backend API call
        try {
            console.log(BACKEND_API);

            const res = await apiHandler(
                {
                    courseName,
                    year,
                    quarter,
                    sectionNumber,
                    userID: userSession.id,
                },
                "POST",
                "course/createCourse",
                `${BACKEND_API}`
            );

            // Response handler
            if (res.ok) {
                toast.success("Course created successfully");
            } else {
                toast.error("Failed to create course");
            }

            // Error message
            if (!res.message.includes('success')) throw Error(res.message);
        } catch (error) {
            toast.error("Course Creation Failed");
        }
    };

    return (
        <section className="p-4 bg-zinc-900 rounded-lg shadow-md w-1/2 mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center underline">Create a Course</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Course Name */}
                <label className="flex flex-col">
                    Course Name:
                    <input
                        type="text"
                        name="courseName"
                        value={courseName}
                        onChange={data}
                        className="border p-2 rounded mt-1"
                        required
                        placeholder="Math 330 Discrete Math"
                    />
                </label>

                {/* Section Number */}
                <label className="flex flex-col">
                    Section Number
                    <input
                        type="text"
                        name="sectionNumber"
                        value={sectionNumber}
                        onChange={data}
                        className="border p-2 rounded mt-1"
                        placeholder="001"
                    />
                </label>

                {/* Year */}
                <label className="flex flex-col">
                    Year:
                    <input
                        type="number"
                        value={year}
                        name="year"
                        onChange={data}
                        className="border p-2 rounded mt-1"
                        required
                        placeholder="2025"
                        min="2000"
                    />
                </label>


                {/* Quarter Dropdown */}
                <label className="flex flex-col">
                    Quarter:
                    <select
                        value={quarter}
                        name="quarter"
                        onChange={data}
                        className="border p-2 rounded mt-1"
                    >
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                    </select>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded"
                >
                    Create Course
                </button>
            </form>
        </section>
    );
}
