/**
 * This is the login page that will render
 * the layout needed to log in
 * This will handle validation and error catching
 * when the log in process fails
 * @author Joshua Summers
 */

"use client";
import { getSession, signIn } from "next-auth/react";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import {RingSpinner} from "@/components/UI/Spinners";

/**
 * SignInForm Page (Component)
 * @constructor
 */
export default function SignInForm() {
    const [username , setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle the Submit button event
     * @param event DOM event
     */
    async function handleSubmit(event: any) {
        event.preventDefault();
        // Update loading state
        setIsLoading(true);
        try{
            const result = await signIn("credentials", {
                username,
                email,
                password,
                redirect: false,
            });
            // Handle errors
            if (result?.error) {
                setError(result?.error);
            // Redirect if no errors
            } else if (result?.ok) {
                // Force session refresh across all components
                const session = await getSession();
                // Force hard redirection (refreshes all components)
                window.location.href = '/dashboard';
            }
        }
        // Catch general errors with login
        catch(error){
            console.log(error);
            setError("Login Failed");
        }
        // Reset the loading state at the end
        finally{
            // Update loading state (delayed to happen after redirect)
            setTimeout(() => {
                setIsLoading(false);
            }, 200);
        }
    }

    return (
        <div>
            <div className="container mx-auto max-w-md">
                <h1 className="text-3xl text-mentat-gold">Sign In</h1>
                <form className="mt-4" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-mentat-gold text-sm mb-2"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            className="rounded-lg py-2 px-3 mb-2 text-mentat-black/80 placeholder-mentat-black/50
                        [&:-webkit-autofill] leading-tight focus:outline-none shadow-md shadow-crimson-700
                        focus:border-crimson-700 focus:ring-crimson-700 w-full"
                            type="text"
                            name="username"
                            placeholder="Username"
                            required={true}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label
                            className="block text-mentat-gold text-sm mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            className="rounded-lg py-2 px-3 mb-2 text-mentat-black/80 placeholder-mentat-black/50
                        [&:-webkit-autofill] leading-tight focus:outline-none shadow-md shadow-crimson-700
                        focus:border-crimson-700 focus:ring-crimson-700 w-full"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email"
                            required={true}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label
                            className="block text-mentat-gold text-sm mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className="rounded-lg py-2 px-3 mb-2 text-mentat-black/80 placeholder-mentat-black/50
                        [&:-webkit-autofill] leading-tight focus:outline-none shadow-md shadow-crimson-700
                        focus:border-crimson-700 focus:ring-crimson-700 w-full"
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            required={true}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-crimson text-mentat-gold font-bold hover:bg-crimson-700
                        py-2 px-4 rounded-2xl shadow-sm shadow-mentat-gold-700"
                        type="submit"
                    >
                        { isLoading ? (
                            <div className="flex justify-center items-center">
                                <RingSpinner size={'xs'} color={'mentat-gold'} />
                                <p className="ml-3 text-sm text-mentat-gold">Logging in...</p>
                            </div>
                        ) : 'Sign In' }
                    </button>
                    <ToastContainer autoClose={3000} hideProgressBar />
                </form>
            </div>
            {error && <div className="mt-2 p-2 bg-red-500/10 rounded-xl">
                <p className="text-red-500 text-sm">{error}</p>
            </div>}
        </div>
    );
}