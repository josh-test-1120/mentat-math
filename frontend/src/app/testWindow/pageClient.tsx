"use client";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import {SessionProvider, useSession} from 'next-auth/react'
import Modal from "@/app/_components/UI/Modal";
import Calendar from "../_components/UI/Calendar";
import CreateTestWindow from "../_components/testWindow/CreateTestWindow";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Default Schedule Page
 * @constructor
 */
export default function TestWindowPage() {
    // State information
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        exam_course_id: 1,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: "",
    });

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session information
    const { data: session } = useSession()

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
        }
    }, [session]);

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

    /**
     * Handle calendar event creation (drag and drop)
     * @param info Calendar selection info
     */
    const handleEventCreate = (info: { start: string; end: string; allDay: boolean }) => {
        const startDate = new Date(info.start);
        const endDate = new Date(info.end);
        
        // Pre-fill form with selected time range
        setFormData(prev => ({
            ...prev,
            exam_name: `Exam - ${startDate.toLocaleDateString()}`,
        }));
        
        // Open the modal
        setIsModalOpen(true);
        
        // Store the time range for later use
        setFormData(prev => ({
            ...prev,
            startTime: startDate.toISOString().slice(0, 16),
            endTime: endDate.toISOString().slice(0, 16),
        }));
    };

    /**
     * Handle calendar event click
     * @param info Event click info
     */
    const handleEventClick = (info: any) => {
        console.log('Event clicked:', info.event);
        toast.info(`Clicked on: ${info.event.title}`);
    };

    const handleTestWindowCreated = () => {
        setIsModalOpen(false);
        toast.success('Test window created successfully!');
    };

    return (
        <div className="h-full w-full flex flex-col">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Test Window">
                <CreateTestWindow isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTestWindowCreated={handleTestWindowCreated}/>
            </Modal>
            
            <div className="flex-1 w-full">
                <Calendar
                    events={[
                        { title: 'Exam 1', start: '2025-09-20', id: '1' },
                        { title: 'Exam 2', start: '2025-09-22T14:00:00', id: '2' },
                    ]}
                    onDateClick={({ dateStr }) => setIsModalOpen(true)}
                    onEventClick={handleEventClick}
                    onEventCreate={handleEventCreate}
                    initialView="timeGridWeek"
                    editable={true}
                    selectable={true}
                />
            </div>

            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}