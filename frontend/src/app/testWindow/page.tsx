import { getServerAuthSession } from "@/utils/auth";
import TestWindowPage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"
import {Session} from "next-auth";
import InstructorCoursesClient from "@/app/instructorCourses/pageClient";
import CreateTestWindow from "@/app/createTestWindow/pageClient";
import TestWindowExample from "@/app/_components/testWindow/TestWindowExample";
import TestWindowCalendar from "@/app/_components/UI/TestWindowCalendar";

/**
 * Default session for users no logged in
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
 * @constructor
 */
export default async function TestWindow() {
    // Session variable
    const session =  await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <AuthProvider session={session}>
            <div className="h-full w-full flex flex-col">
                <TestWindowPage/>
                {/* Any other components that need auth */}
            </div>
        </AuthProvider>
    );
}

