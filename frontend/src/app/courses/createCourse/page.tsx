// frontend/src/app/my-courses/page.tsx
import { getServerAuthSession } from "@/utils/auth";
import CreateCourse from "./pageClient";
import { AuthProvider } from "@/components/authProvider";
import { Session } from "next-auth";

const DEFAULT_SESSION: Session = {
    user: {
        id: '',
        username: 'Guest',
        email: '',
    },
    expires: ''
};

export default async function CreateCoursePage() {
    // Get session server-side
    const session: Session = await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <AuthProvider session={session}>
            <CreateCourse />
        </AuthProvider>
    );
}