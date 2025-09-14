"use client";

import React, { useState } from "react";
import CreateTestWindow from "./CreateTestWindow";

// Example component showing how to use CreateTestWindow
export default function TestWindowExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data - in real app, this would come from your API
  const mockCourses = [
    { id: 1, name: "Mathematics 101", section: "A" },
    { id: 2, name: "Physics 201", section: "B" },
    { id: 3, name: "Chemistry 301", section: "C" }
  ];

  const mockExams = [
    { id: 1, name: "Midterm Exam", courseId: 1 },
    { id: 2, name: "Final Exam", courseId: 1 },
    { id: 3, name: "Lab Practical", courseId: 2 },
    { id: 4, name: "Theory Test", courseId: 3 }
  ];

  const handleTestWindowCreated = () => {
    console.log("Test window created successfully!");
    // Add your logic here to refresh data, show success message, etc.
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Open Create Test Window Modal
      </button>

      <CreateTestWindow
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestWindowCreated={handleTestWindowCreated}
        courses={mockCourses}
        exams={mockExams}
      />
    </div>
  );
}
