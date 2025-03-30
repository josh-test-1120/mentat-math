'use client'

import React, { useState } from 'react';
import { Card, CardContent, Button } from "@/app/_components/UI/ui"

export default function JoinCourseComponent() {
    const [courseId, setCourseId] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Joining course with ID:", courseId);
        // Add your joining logic here
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
