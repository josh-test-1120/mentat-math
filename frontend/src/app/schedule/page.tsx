"use client";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default function Grades() {

    const [formData, setFormData] = useState({
        exam_course_id: 1,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: "",
    });
    const {exam_course_id, exam_name, exam_difficulty, is_published, is_required} = formData;

    const data = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    // const [exam_course_id , setCourseID] = useState(0);
    // const [exam_name, setCourseName] = useState("");
    // const [exam_difficulty, setCourseDifficulty] = useState(0);
    // const [is_published, setIsPublished] = useState(false);
    // const [is_required, setIsRequired] = useState(false);
    // const [is_validated, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
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
            if (response.ok) {
                toast.success("Exam created successfully");
            } else {
                toast.error("Failed to create exam");
            }
        } catch (error) {
            toast.error("Failed to create exam");
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl h-screen bg-mentat-black text-mentat-gold">
            <h1 className="text-2xl text-center mb-5">Create Exam</h1>
            <form id="createExamForm" className="mx-auto w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-1 flex-col align-bottom"
                  onSubmit={handleSubmit}>
                <label>Exam Name:
                    <input
                        type="text"
                        id="exam_name"
                        name="exam_name"
                        value={exam_name}
                        onChange={data}
                        required={true}
                        className="float-right text-mentat-black"
                    />
                </label>
                <label><br/><br/>
                    Exam Course:
                    <select
                        id="exam_course_id"
                        name="exam_course_id"
                        value={exam_course_id}
                        onChange={data}
                        required={true}
                        className="float-right text-mentat-black"
                    >
                        <option value="1">Mathematics</option>
                        <option value="2">Physics</option>
                        <option value="3">Chemistry</option>
                    </select>
                </label><br/><br/>
                <label>Exam Difficulty:
                    <select
                        id="exam_difficulty"
                        name="exam_difficulty"
                        value={exam_difficulty}
                        onChange={data}
                        required={true}
                        className="float-right text-mentat-black"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </label><br/><br/>
                <label>Make Exam Required?
                    <input
                        id="is_required"
                        type="checkbox"
                        name="is_required"
                        checked={is_required}
                        onChange={data}
                        className="float-right"
                    />
                </label>
                <br/><br/>
                <label>Publish Exam?
                    <input
                        id="is_published"
                        type="checkbox"
                        name="is_published"
                        checked={is_published}
                        onChange={data}
                        className="float-right"
                    />
                </label>
                <br/><br/>
                <button
                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Create Exam
                </button>
                {/*<input type="submit" value="Create Exam" onClick={handleSubmit}/>*/}
            </form>
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}