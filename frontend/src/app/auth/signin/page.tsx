import SignInForm from "./signInForm";

/**
 * Page Metadata
 */
export const metadata = {
    title: "Login Page",
    description: "Login page for EZMath Application",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

/**
 * Login Page
 * @constructor
 */
export default async function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700 p-4">
            <div className="rounded-lg p-12 shadow-md bg-gray-200">
                <h2 className="mb-4 text-2xl font-medium text-gray-800">
                    Weclome Back!
                </h2>
                <SignInForm />
            </div>
        </div>
    );
}