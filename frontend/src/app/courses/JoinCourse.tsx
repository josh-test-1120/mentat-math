'use client'

import React, {useEffect, useState} from 'react';
import { Card, CardContent, Button } from "@/app/_components/UI/ui"
import {useSession} from "next-auth/react";
import {apiHandler} from "@/utils/api";
import {toast} from "react-toastify";

export default function JoinCourseComponent() {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    const [courseId, setCourseId] = useState("");

    // Session Information
    const { data: session, status } = useSession();

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Joining State
    const [isJoining, setIsJoining] = useState(false);

    // Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;
    
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            };
            
            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
            
            console.log("User session NAME: " + session.user.username);
            console.log("User session ID: " + newUserSession.id);
        }
    }, [session, status]); // Added status to dependencies


    // Handle Submit
    const handleSubmit = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // Prevent double submission
        if (isJoining) return;
    
        // Validate user ID
        if (!userSession.id) {
            toast.error("Please log in to join a course");
            return;
        }
        // Validate course ID
        if (!courseId.trim()) {
            toast.error("Please enter a course ID");
            return;
        }
    
        // Set joining state
        setIsJoining(true);

        // Try wrapper to handle async exceptions
        try {
            console.log("USER SESSION ID IS:", userSession.id);
            console.log("USER SESSION ID IS TYPE:", typeof userSession.id);
            console.log("COURSE ID IS TYPEOF:", typeof courseId);
            console.log("COURSE ID IS:", courseId);
            // API Handler
            const res = await apiHandler(
                { studentId: userSession.id, courseId },
                "POST",
                "course/joinCourse",
                `${BACKEND_API}`
            );
    
            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.error || "Failed to join course");
            } else {
                toast.success("Successfully joined the course!");
                setCourseId("");
                console.log("LOGGING COURSE SUCCESS.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Join Course Failed");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="flex inset-0 justify-center items-center">
            <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
                <CardContent>
                    <h1 className="text-2xl font-bold mb-4">Join a Course</h1>
                    <p className="text-white mb-6">Enter the Course ID to join a course.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Course ID"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            className="w-full py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isJoining || !userSession.id}
                        >
                            {isJoining ? "Joining..." : "Join Course"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
