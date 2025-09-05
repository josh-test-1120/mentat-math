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

    useEffect(() => {
        // Fetch courses from backend
        if (status !== "authenticated") return;

        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            if (userSession.id != "") {
                setSessionReady(true);
            }
            console.log("User session NAME: " + session.user.username)
        }
    }, [session]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Joining course with ID:", courseId);

        // Add your joining logic here
        try {
            const res = await apiHandler({
                userID: userSession.id,
                courseId,
            },
            "POST",
                "course/joinCourse",
                `${BACKEND_API}`
            );
        }catch (error) {
            toast.error("Join Course Failed");
        }
    };

    return (
        <div className="flex inset-0 justify-center items-center">
            <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
                <CardContent>
                    <h1 className="text-2xl font-bold mb-4">Join a Course</h1>
                    <p className="text-gray-600 mb-6">Enter the Course ID to join a course.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Course ID"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button type="submit" className="w-full py-2 rounded-lg">
                            Join Course
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
