"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default async function Grades() {

    const [formData, setFormData] = useState({
        exam_course_id: 0,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: "",
    });
    const {exam_course_id, exam_name, exam_difficulty, is_published, is_required} = formData;

    const data = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // const [exam_course_id , setCourseID] = useState(0);
    // const [exam_name, setCourseName] = useState("");
    // const [exam_difficulty, setCourseDifficulty] = useState(0);
    // const [is_published, setIsPublished] = useState(false);
    // const [is_required, setIsRequired] = useState(false);
    // const [is_validated, setError] = useState("");

    //async function handleSubmit(event: any) {
    const handleSubmit = async (event: any) => {
        event.preventDefault();
        try{
            await apiHandler({
                exam_course_id,
                exam_name,
                exam_difficulty,
                is_published,
                is_required
                }, 'GET',
                'api/createExam/',
                `${BACKEND_API}`
            );

        }
        catch(error){
            toast.error("Failed to create exams");
        }
    }

    return (
        <div>
            <h1>Create Exam</h1>
            <form id="createExamForm" onSubmit={handleSubmit}>
                <label>Exam Name:
                    <input
                        type="text"
                        id="exam_name"
                        name="exam_name"
                        value={exam_name}
                        onChange={data}
                        required={true}
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
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </label><br/><br/>
                <label>Make Exam Required?
                    <input type="hidden" name="is_required" value="false"/>
                    <input
                        id="is_required"
                        type="checkbox"
                        name="is_required"
                        value={is_required}
                        onChange={data}
                        required={true}
                    />
                </label>
                <br/><br/>
                <label>Publish Exam?
                    <input type="hidden" name="is_published" value="false"/>
                    <input
                        id="is_published"
                        type="checkbox"
                        name="is_published"
                        value={is_published}
                        onChange={data}
                        required={true}
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
        </div>
    );
}
