'use client'

import React, {useEffect, useState} from 'react';
import { Card, CardContent } from "@/components/UI/calendar/ui"
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";

interface JoinCourseComponentProps {
  onJoinSuccess?: () => void;
}

/**
 * This is the Join Course component
 * that will join a student to a course
 * based on the course ID
 * @param onJoinSuccess
 * @constructor
 * @author Telmen Enkhtuvshin
 */
export default function JoinCourseComponent({ onJoinSuccess }: JoinCourseComponentProps) {
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    const [courseId, setCourseId] = useState("");

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

    // Joining State
    const [isJoining, setIsJoining] = useState(false);

    /**
     * This is the useEffect for initial Hydration
     */
    useEffect(() => {
        if (status !== "authenticated") return;
    
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || ''
            };
            
            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]); // Added status to dependencies


    /**
     * This is the submit form handler
     * @param event
     */
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
            // API Handler
            const res = await apiHandler(
                { studentId: userSession.id, courseId },
                "POST",
                "api/course/joinCourse",
                `${BACKEND_API}`,
                userSession.accessToken || undefined
            );
    
            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.error || "Failed to join course");
            } else {
                toast.success("Successfully joined the course!");
                setCourseId("");
                
                // Call the success callback to close modal and refresh courses
                if (onJoinSuccess) {
                    onJoinSuccess();
                }
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
                    <p className="text-white mb-6">Tip: Ask your instructor for the Course ID.</p>

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
                            className="w-full py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#A30F32' }}
                            disabled={isJoining || !userSession.id}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {isJoining ? "Joining..." : "Join Course"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
