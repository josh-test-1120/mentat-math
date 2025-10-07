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
        <div className="flex min-h-screen items-center justify-center text-mentat-gold font-bold  p-4
            bg-mentat-black">
            <div className="rounded-lg p-12 shadow-md bg-white/10 shadow-lg shadow-crimson-700">
                <h2 className="mb-4 text-2xl font-medium">
                    Weclome Back!
                </h2>
                <SignInForm />
            </div>
        </div>
    );
}