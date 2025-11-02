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
                        className="border border-mentat-gold-700 rounded-lg py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 [&:-webkit-autofill]
                            leading-tight focus:outline-none focus:shadow-outline w-full"
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
                        className="border border-mentat-gold-700 rounded-lg py-2 px-3 mb-2
                            text-crimson-700/80 placeholder-mentat-black/50 [&:-webkit-autofill]
                            leading-tight focus:outline-none focus:shadow-outline w-full"
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
                        className="border border-mentat-gold-700 rounded-lg py-2 px-3
                            text-crimson-700/80 placeholder-mentat-black/50 leading-tight
                            focus:outline-none focus:shadow-outline w-full"
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className="bg-crimson text-mentat-gold font-bold hover:bg-crimson-700
                        py-2 px-4 rounded-2xl shadow-sm shadow-mentat-gold-700"
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