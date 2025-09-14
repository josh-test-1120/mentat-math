import { getServerAuthSession } from "@/utils/auth";
import TestWindowsPageClient from "./pageClient";
import { AuthProvider } from "@/components/authProvider";
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
 * Backend Server Side Page with AuthProvider session handler
 * injection into Client Side Page
 */
export default async function TestWindowsPage() {
    // Get server-side session
    const session = await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <AuthProvider session={session}>
            <TestWindowsPageClient />
        </AuthProvider>
    );
}
