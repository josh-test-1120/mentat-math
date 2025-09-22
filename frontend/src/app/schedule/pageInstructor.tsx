"use client";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import {SessionProvider, useSession} from 'next-auth/react'
import Modal from "@/app/_components/UI/Modal";
import Calendar from "../_components/UI/Calendar";
import { Course } from "@/app/_components/types/exams";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Default Schedule Page
 * @constructor
 */
export default function Schedule() {

    // Session information
    const { data: session } = useSession()
    // State information
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        exam_course_id: 1,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: ""
    });

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Form Mapping
    const {exam_course_id, exam_name, exam_difficulty, is_published, is_required} = formData;

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
            setSessionReady(prev => prev || userSession.id !== "");

            // Get the course data
            getCourses();
        }
    }, [session]);


  const getCourses  = async () => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/courses`,
                `${BACKEND_API}`
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
                setCourses([]);
            } else {
                // Convert object to array
                let coursesData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    coursesData = res;
                // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    coursesData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                // If res is not an array or object, set coursesData to an empty array
                } else {
                    coursesData = [];
                }

                console.log('Processed courses data before:', coursesData);

                // Filter out invalid entries
                coursesData = coursesData.filter(c => c && typeof c === 'object');

                console.log('Processed courses data after:', coursesData);
                // Set courses to coursesData
                setCourses(coursesData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching courses:', e);
            // Set courses to empty array
            setCourses([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    }

    // Setting data by name, value, type, and checked value
    const data = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            // Spread data
            ...formData,
            // Override field name's value by type checkbox for correctness
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    /**
     * Submit button for Form
     * @param event Event from DOM
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default events

        // Try wrapper to handle async exceptions
        try {
            console.log(`This is the session info: ${userSession}`)
            let index = 1;
            console.log(`This is the exam course id: ${exam_course_id}`)
            const response = await fetch("http://localhost:8080/api/createExam", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_name,
                    is_published: is_published ? 1 : 0,
                    is_required: is_required ? 1 : 0,
                    exam_difficulty,
                    exam_course_id,
                })
            });
            console.log(`This is the response:`);
            console.log(response);
            // Response handler
            if (response.ok) {
                toast.success("Exam created successfully");
                setIsModalOpen(false);
                setFormData({
                    exam_course_id: 1,
                    exam_name: "",
                    exam_difficulty: "",
                    is_published: "",
                    is_required: "",
                });
            } else {
                toast.error("Failed to create exam");
            }
        } catch (error) {
            toast.error("Failed to create exam");
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl h-screen bg-mentat-black text-mentat-gold">
            <div className="p-6">
                <button
                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Exam
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Exam">
                <form id="createExamForm" className="w-full space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_name" className="text-sm">Exam Name</label>
                            <input
                                type="text"
                                id="exam_name"
                                name="exam_name"
                                value={exam_name}
                                onChange={data}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                placeholder="Enter exam name"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_course_id" className="text-sm">Exam Course</label>
                            <select
                                id="exam_course_id"
                                name="exam_course_id"
                                value={exam_course_id}
                                onChange={data} // or onChange={(e) => setExamCourseId(e.target.value)}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            >
                                {/* Default option */}
                                <option value="">Select a course</option>

                                {/* Map over courses array to generate options */}
                                {courses.map((course) => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/*<div className="flex flex-col gap-2">*/}
                        {/*    <label htmlFor="exam_course_id" className="text-sm">Exam Course</label>*/}
                        {/*    <select*/}
                        {/*        id="exam_course_id"*/}
                        {/*        name="exam_course_id"*/}
                        {/*        value={exam_course_id}*/}
                        {/*        onChange={data}*/}
                        {/*        required={true}*/}
                        {/*        className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"*/}
                        {/*    >*/}
                        {/*        <option value="1">Mathematics</option>*/}
                        {/*        <option value="2">Physics</option>*/}
                        {/*        <option value="3">Chemistry</option>*/}
                        {/*    </select>*/}
                        {/*</div>*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_difficulty" className="text-sm">Exam Difficulty</label>
                            <select
                                id="exam_difficulty"
                                name="exam_difficulty"
                                value={exam_difficulty}
                                onChange={data}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_required"
                                    type="checkbox"
                                    name="is_required"
                                    checked={Boolean(is_required)}
                                    onChange={data}
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                />
                                <label htmlFor="is_required" className="select-none">Make Exam Required</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    name="is_published"
                                    checked={Boolean(is_published)}
                                    onChange={data}
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                />
                                <label htmlFor="is_published" className="select-none">Publish Exam</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold py-2 px-4 rounded-md border border-mentat-gold/20"
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
                            type="submit"
                        >
                            Create Exam
                        </button>
                    </div>
                </form>
            </Modal>
            <Calendar
                events={[
                    { title: 'Exam 1', start: '2025-09-20' },
                    { title: 'Exam 2', start: '2025-09-22T14:00:00' },
                ]}
                onDateClick={({ dateStr }) => setIsModalOpen(true)}
                onEventClick={(info) => console.log(info.event)}
            />

            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}