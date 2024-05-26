// "use client";
// import { useEffect, useState } from "react";
// import { redirect } from "next/navigation";
// import { useSession, signIn } from "next-auth/react";
// import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer, toast } from "react-toastify";
// import Link from "next/link";
//
// const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
//
// export default function SignUp() {
//
//     const [formData, setFormData] = useState({
//         firstname: "",
//         lastname: "",
//         username: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//     });
//     const { firstname, lastname, username, email, password, confirmPassword } = formData;
//
//     const data = (e: any) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };
//
//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//
//         //var BACKEND_API = process.env.BACKEND_API;
//         console.log(BACKEND_API);
//         console.log(lastname);
//
//         if (formData.password !== formData.confirmPassword) {
//             toast.error("Passwords do not match");
//             return;
//         }
//         try {
//             console.log(BACKEND_API);
//             console.log()
//             const res = await fetch(`${BACKEND_API}/api/auth/signup`, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     firstname,
//                     lastname,
//                     username,
//                     email,
//                     password,
//                 }),
//             });
//
//             const data = await res.json();
//             console.log("data", data);
//
//             if (!res.ok) throw Error(data.message);
//
//             // start session after signup
//             await signIn("credentials", {
//                 firstname,
//                 lastname,
//                 email,
//                 password,
//                 callbackUrl:"/dashboard",
//             }      );
//         } catch (error) {
//             toast.error("Invalid credentials");
//         }
//     };
//
//     return (
//         <div className={main}>
//             <p id="currentDate"><b>Today: May 12th, 2024</b></p>
//             <h2>Welcome to EZMath Quiz Scheduler!</h2>
//             <p>Current Report.Course: MATH330</p>
//             <p>Hello, Student Telmen!</p>
//             <p>You have <i id="totalScheduled">0</i> tests scheduled for now, let's go schedule!</p>
//         </div>
//     );
// }