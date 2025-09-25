// frontend/src/app/my-courses/page.tsx
import { getServerAuthSession } from "@/utils/auth";
import MyCoursesClient from "./pageClient";
import { AuthProvider } from "@/components/authProvider";
import { Session } from "next-auth";
import InstructorCoursesClient from "../instructorCourses/pageClient";

const DEFAULT_SESSION: Session = {
    user: {
        id: '',
        username: 'Guest',
        email: '',
    },
    expires: ''
};

export default async function MyCoursesPage() {
    // Get session server-side
    const session: Session = await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <AuthProvider session={session}>
            {/* <MyCoursesClient /> */}
            <InstructorCoursesClient />
        </AuthProvider>
    );
}