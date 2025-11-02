"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import apiAuthSignIn, {apiHandler} from "@/utils/api";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

export default function SignUp() {

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        userType: "Student",
        password: "",
        confirmPassword: "",
    });
    const { firstname, lastname, username, email, userType, password, confirmPassword } = formData;
    const data = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * Submit button handler
     * @param e DOM event
     */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        //var BACKEND_API = process.env.BACKEND_API;
        console.log(BACKEND_API);
        console.log(lastname);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            console.log(BACKEND_API);
            console.log()

            const res = await apiHandler(
                {
                    firstname,
                    lastname,
                    username,
                    email,
                    userType,
                    password,
                },
                "POST",
                "api/auth/signup",
                `${BACKEND_API}`
            )

            if (!res.message.includes('success')) throw Error(res.message);

            // start session after signup
            await signIn("credentials", {
                firstname,
                lastname,
                email,
                userType,
                username,
                password,
                callbackUrl:"/dashboard",
            });
        } catch (error) {
            toast.error("Invalid credentials");
        }

    };

    return (
        <div
            className="flex justify-center text-mentat-gold
                bg-mentat-black">
            <form
                onSubmit={handleSubmit}
                className="bg-white/10 shadow-lg shadow-crimson-700 rounded-2xl px-8 pt-2
                    pb-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/3 flex flex-col my-2"
            >
                <h1 className="text-3xl text-mentat-gold font-bold mb-4">Sign Up</h1>
                <div className="mb-1">
                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="firstname"
                    >
                        First Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 leading-tight focus:outline-none
                            focus:shadow-outline"
                        type="text"
                        name="firstname"
                        placeholder="First Name"
                        value={firstname}
                        onChange={data}
                        required={true}
                    />
                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="lastname"
                    >
                        Last Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 leading-tight focus:outline-none
                            focus:shadow-outline"
                        type="text"
                        name="lastname"
                        placeholder="Last Name"
                        value={lastname}
                        onChange={data}
                        required={true}
                    />

                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 leading-tight focus:outline-none
                            focus:shadow-outline"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={data}
                        required={true}
                    />
                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 leading-tight focus:outline-none
                            focus:shadow-outline"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={data}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="block text-mentat-gold text-sm">User Type</label>

                        {/* Instructor Radio Button */}
                        <label
                            className={`flex items-center gap-3 cursor-pointer px-4 py-2 border-2
                                rounded-lg transition-all ${
                                userType === "Instructor"
                                    ? "border-blue-500 shadow-[0_0_10px_#3b82f6] bg-blue-100"
                                    : "border-gray-300 bg-white"
                            }`}
                        >
                            <input
                                type="radio"
                                name="userType"
                                value="Instructor"
                                checked={userType === "Instructor"}
                                onChange={data}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center
                                    justify-center transition-all ${
                                    userType === "Instructor" ? "border-blue-500" : "border-gray-400"
                                }`}
                            >
                                {userType === "Instructor" && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                            <span className="text-crimson-700/80 font-medium">Instructor</span>
                        </label>

                        {/* Student Radio Button */}
                        <label
                            className={`flex items-center gap-3 cursor-pointer px-4 py-2 border-2 rounded-lg transition-all ${
                                userType === "Student"
                                    ? "border-green-500 shadow-[0_0_10px_#22c55e] bg-green-100"
                                    : "border-gray-300 bg-white"
                            }`}
                        >
                            <input
                                type="radio"
                                name="userType"
                                value="Student"
                                checked={userType === "Student"}
                                onChange={data}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    userType === "Student" ? "border-green-500" : "border-gray-400"
                                }`}
                            >
                                {userType === "Student" && (
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                )}
                            </div>
                            <span className="text-crimson-700/80 font-medium">Student</span>
                        </label>
                    </div>
                </div>
                <div className="mb-4">
                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-crimson-700/80
                         placeholder-mentat-black/50 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="******************"
                        value={password}
                        onChange={data}
                        required={true}
                    />
                    <label
                        className="block text-mentat-gold text-sm mb-2"
                        htmlFor="confirmPassword"
                    >
                        Confirm Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-crimson-700/80
                         placeholder-mentat-black/50 leading-tight focus:outline-none focus:shadow-outline"
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="******************"
                        value={confirmPassword}
                        onChange={data}
                        required={true}
                    />
                </div>
                <div className="flex flex-col items-center justify-between">
                    <button
                        className="bg-crimson hover:bg-crimson-700 text-mentat-gold font-bold
                            w-full py-2 px-4 rounded-2xl focus:outline-none focus:shadow-outline
                            shadow-sm shadow-mentat-gold-700"
                        type="submit"
                    >
                        Sign Up
                    </button>
                    <Link
                        className="align-baseline ml-2 font-bold text-sm text-mentat-gold
                            hover:text-mentat-gold-700 mt-3"
                        href="/auth/signin"
                    >
                        Already have an account?
                    </Link>
                </div>
            </form>
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}