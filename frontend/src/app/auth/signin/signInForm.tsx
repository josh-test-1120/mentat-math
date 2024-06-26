"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ToastContainer } from "react-toastify";

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
        try{
            await signIn("credentials", {
                username,
                email,
                password,
                callbackUrl: "/dashboard",
                redirect: true,
            });

        }
        catch(error){
            setError("Invalid credentials");
        }
    }

    return (
        <div className="container mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-mentat-gold">Sign In</h1>
            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="block text-amber-600 text-sm font-bold mb-2"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        className="border border-gray-400 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                        type="text"
                        name="username"
                        placeholder="Username"
                        required={true}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label
                        className="block text-amber-600 text-sm font-bold mb-2"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        className="border border-gray-400 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email"
                        required={true}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label
                        className="block text-amber-600 text-sm font-bold mb-2"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        className="border border-gray-400 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className="bg-gradient-to-r from-red-700 to-red-800 border border-gray-300 text-amber-400 font-bold hover:bg-fuchsia-600 py-2 px-4 rounded"
                    type="submit"
                >
                    Sign In
                </button>
                <ToastContainer autoClose={3000} hideProgressBar />
            </form>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}