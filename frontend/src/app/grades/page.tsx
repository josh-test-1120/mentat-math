import { getServerAuthSession } from "@/utils/auth";
import StudentsPage from "./pageStudent";
import InstructorsPage from "./pageInstructor";
import {Session} from "next-auth";

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
export default async function Grades() {
    // Session variable
    const session: Session =  await getServerAuthSession() ?? DEFAULT_SESSION;

    // Conditional rendering
    if (session?.user?.userType == "Instructor")
        return (
            <section
                id={"gradePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <InstructorsPage/>
            </section>
        );
    else
        return (
            <section
                id={"gradePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <StudentsPage/>
            </section>
        );
}

