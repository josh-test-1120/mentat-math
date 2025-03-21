"use client";
import { useState } from "react";
import {apiHandler} from "@/utils/api";
import {signIn} from "next-auth/react";
import {toast} from "react-toastify";

export default function CreateCourse() {
    const [courseName, setCourseName] = useState("");
    const [year, setYear] = useState("");
    const [quarter, setQuarter] = useState("Fall");
    const [sectionNumber, setSectionNumber] = useState("");

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const courseData = { courseName, year, quarter, sectionNumber };
        console.log("Course Created:", courseData);
        // const userInfo = await fetchUserInfo();
        // console.log("User info:", userInfo);

        // Creating Course through backend API call
        try {
            console.log(BACKEND_API);

            const res = await apiHandler(
                courseData,
                "POST",
                "course/createCourse",
                `${BACKEND_API}`
            )
            // Error message
            if (!res.message.includes('success')) throw Error(res.message);

        } catch (error) {
            toast.error("Course Creation Failed");
        }
    };

    // Function to fetch user information from the context backend
    const fetchUserInfo = async () => {
        // const token = localStorage.getItem("authToken");
        // if (!token) {
        //     console.log("NO TOKEN!!!")
        //     return null;
        // }

        const response = await fetch(`${BACKEND_API}/api/auth/me`
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
        );

        if (response.ok) {
            console.log("okay!!!")
            return response.json();
        } else {
            console.log("Not okay!!!");
            return response.json();
        }
    };

    return (
        <section className="p-6 bg-zinc-900 rounded-lg shadow-md w-1/2 mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center underline">Create a Course</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Course Name */}
                <label className="flex flex-col">
                    Course Name:
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
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
                        onChange={(e) => setSectionNumber(e.target.value)}
                        className="border p-2 rounded mt-1"
                        placeholder="123"
                    />
                </label>

                {/* Year */}
                <label className="flex flex-col">
                    Year:
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
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
                        onChange={(e) => setQuarter(e.target.value)}
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
