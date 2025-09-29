// frontend/src/app/my-courses/page.tsx
import { getServerAuthSession } from "@/utils/auth";
import MyCoursesStudent from "./pageStudent";
import MyCoursesInstructor from "./pageInstructor";
import { Session } from "next-auth";

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

    // Conditional rendering
    if (session?.user?.userType == "Instructor")
        return (
            <MyCoursesInstructor />
        );
    else
        return (
            <MyCoursesStudent />
        );
}