'use client'

import {toast} from "react-toastify";
import { useSession } from 'next-auth/react'
import {useState} from "react";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default function TestWindowPage() {

    // Session ready flag state variable
    const [sessionReady, setSessionReady] = useState(false);
    // State flag variable for Modal Opening
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    const [formData, setFormData] = useState({
        exam_course_id: 1,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: "",
    });
    // Form Mapping
    const {exam_course_id, exam_name, exam_difficulty, is_published, is_required} = formData;

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
}