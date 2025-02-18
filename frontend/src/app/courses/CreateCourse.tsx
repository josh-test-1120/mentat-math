"use client";

import { useState } from "react";


export default function CreateCourse() {
    const [courseName, setCourseName] = useState("");
    const [year, setYear] = useState("");
    const [quarter, setQuarter] = useState("Fall");
    const [sectionNumber, setSectionNumber] = useState("");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const courseData = { courseName, year, quarter };
        console.log("Course Created:", courseData);
        //
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
