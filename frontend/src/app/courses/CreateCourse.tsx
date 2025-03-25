// "use client";
// import {useEffect, useState} from "react";
// import {apiHandler, apiTokenHandler} from "@/utils/api";
// import {SessionProvider, signIn, useSession} from "next-auth/react";
// import {toast} from "react-toastify";
//
// /**
//  * Default CreateCourse Page
//  * @constructor
//  */
// export default function CreateCourse() {
//     const [courseName, setCourseName] = useState("");
//     const [year, setYear] = useState("");
//     const [quarter, setQuarter] = useState("Fall");
//     const [sectionNumber, setSectionNumber] = useState("");
//
//     const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
//
//     // Session
//     const [sessionReady, setSessionReady] = useState(false);
//     const [userSession, setSession] = useState({
//         id: '',
//         username: '',
//         email: ''
//     });
//
//     // // Session information
//     const { data: session, status } = useSession();
//
//     console.log("Session Status:", status);
//     console.log("Session Data:", session);
//
//     /**
//      * Used to handle session hydration
//      */
//     useEffect(() => {
//         if (session) {
//             setSession(() => ({
//                 id: session?.user.id?.toString() || '',
//                 username: session?.user.username || '',
//                 email: session?.user.email || ''
//             }));
//             if (userSession.id != "") { setSessionReady(true); }
//             console.log("Session is active...!");
//             console.log("User session NAME: " + session.user.username)
//         }
//     }, [session]);
//
//     // Logging the session info
//     console.log({session})
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const courseData = { courseName,
//             year,
//             quarter,
//             sectionNumber,
//             username: userSession.username };
//         // Session information
//
//         console.log("Course Created:", courseData);
//         // const userInfo = await fetchUserInfo();
//         // console.log("User info:", userInfo);
//
//         // Creating Course through backend API call
//         try {
//             console.log(BACKEND_API);
//             console.log("TOKEN: " + session?.user.accessToken)
//             const res = await apiTokenHandler(
//                 {
//                     courseName,
//                     year,
//                     quarter,
//                     sectionNumber,
//                     username: userSession.username,
//                 },
//                 "POST",
//                 "course/createCourse",
//                 `${BACKEND_API}`,
//                 session?.user.accessToken
//             )
//             // Error message
//             if (!res.message.includes('success')) throw Error(res.message);
//
//         } catch (error) {
//             toast.error("Course Creation Failed");
//         }
//     };
//
//     return (
//             <section className="p-6 bg-zinc-900 rounded-lg shadow-md w-1/2 mx-auto">
//                 <h2 className="text-xl font-bold mb-4 text-center underline">Create a Course</h2>
//                 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                     {/* Course Name */}
//                     <label className="flex flex-col">
//                         Course Name:
//                         <input
//                             type="text"
//                             value={courseName}
//                             onChange={(e) => setCourseName(e.target.value)}
//                             className="border p-2 rounded mt-1"
//                             required
//                             placeholder="Math 330 Discrete Math"
//                         />
//                     </label>
//
//                     {/* Section Number */}
//                     <label className="flex flex-col">
//                         Section Number
//                         <input
//                             type="text"
//                             name="sectionNumber"
//                             value={sectionNumber}
//                             onChange={(e) => setSectionNumber(e.target.value)}
//                             className="border p-2 rounded mt-1"
//                             placeholder="123"
//                         />
//                     </label>
//
//                     {/* Year */}
//                     <label className="flex flex-col">
//                         Year:
//                         <input
//                             type="number"
//                             value={year}
//                             onChange={(e) => setYear(e.target.value)}
//                             className="border p-2 rounded mt-1"
//                             required
//                             placeholder="2025"
//                             min="2000"
//                         />
//                     </label>
//
//
//                     {/* Quarter Dropdown */}
//                     <label className="flex flex-col">
//                         Quarter:
//                         <select
//                             value={quarter}
//                             onChange={(e) => setQuarter(e.target.value)}
//                             className="border p-2 rounded mt-1"
//                         >
//                             <option value="Fall">Fall</option>
//                             <option value="Winter">Winter</option>
//                             <option value="Spring">Spring</option>
//                             <option value="Summer">Summer</option>
//                         </select>
//                     </label>
//
//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded"
//                     >
//                         Create Course
//                     </button>
//                 </form>
//             </section>
//     );
// }
"use client";

import { useState } from "react";
import {useSession} from "next-auth/react";


export default function CreateCourse() {
    const [courseName, setCourseName] = useState("");
    const [year, setYear] = useState("");
    const [quarter, setQuarter] = useState("Fall");
    const [sectionNumber, setSectionNumber] = useState("");

    // Session information
    const { data: session } = useSession()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const courseData = { courseName, year, quarter };
        console.log("Course Created:", courseData);
        // User session
        console.log(session?.user.accessToken);
    };

    return (
        <section className="p-6 bg-zinc-900 rounded-lg shadow-md w-1/2 mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center underline">Create a Course</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Course Name */}
                <label className="flex flex-col">
                    Course Name:
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="border p-2 rounded mt-1"
                        required
                        placeholder="Math 330 Discrete Math"
                    />
                </label>

                {/* Section Number */}
                <label className="flex flex-col">
                    Section Number
                    <input
                        type="text"
                        name="sectionNumber"
                        value={sectionNumber}
                        onChange={(e) => setSectionNumber(e.target.value)}
                        className="border p-2 rounded mt-1"
                        placeholder="123"
                    />
                </label>

                {/* Year */}
                <label className="flex flex-col">
                    Year:
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="border p-2 rounded mt-1"
                        required
                        placeholder="2025"
                        min="2000"
                    />
                </label>


                {/* Quarter Dropdown */}
                <label className="flex flex-col">
                    Quarter:
                    <select
                        value={quarter}
                        onChange={(e) => setQuarter(e.target.value)}
                        className="border p-2 rounded mt-1"
                    >
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                    </select>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded"
                >
                    Create Course
                </button>
            </form>
        </section>
    );
}
