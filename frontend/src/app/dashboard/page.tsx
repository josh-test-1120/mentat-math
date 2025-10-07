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

    return (
        <section
            id={"dashboardPageMain"}
            className="font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
        >
            {/*Conditional Rendering*/}
            {session?.user?.userType == "Instructor" ?
                (<MyCoursesInstructor />) : (<MyCoursesStudent />)}
        </section>

        );
}