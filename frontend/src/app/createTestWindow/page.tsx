import { getServerAuthSession } from "@/utils/auth";
import { AuthProvider } from "@/components/services/authProvider";
import CreateTestWindowClient from "./pageClient";
import { Session } from "next-auth";

/**
 * Default session for users not logged in
 */
const DEFAULT_SESSION: Session = {
    user: {
        id: '',
        username: 'Guest',
        email: '',
    },
    expires: ''
};

/**
 * Server-side Test Window Page with Authentication
 * @constructor
 */
export default async function CreateTestWindowPage() {
    // Get session server-side
    const session = await getServerAuthSession() ?? DEFAULT_SESSION;
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-mentat-black text-mentat-gold">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                    <p className="text-lg mb-6">Please log in to access the test window creation page.</p>
                    <a 
                        href="/auth/signin" 
                        className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <AuthProvider session={session}>
            <div className="h-full w-full flex flex-col bg-mentat-black text-mentat-gold">
                <CreateTestWindowClient onTestWindowCreated={() => {}} onCancel={() => {}} />
            </div>
        </AuthProvider>
    );
}