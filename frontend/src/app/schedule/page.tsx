import { getServerAuthSession } from "@/utils/auth";
import SchedulesPage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"
import {Session} from "next-auth";
import InstructorCoursesClient from "@/app/instructorCourses/pageClient";
import CreateTestWindow from "@/app/_components/testWindow/CreateTestWindow";
import TestWindowExample from "@/app/_components/testWindow/TestWindowExample";

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
export default async function Schedule() {
    // Session variable
    const session =  await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <AuthProvider session={session}>
            <SchedulesPage/>
        </AuthProvider>
    );
}

