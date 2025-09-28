import { getServerAuthSession } from "@/utils/auth";
import InstructorPage from "./pageInstructor";
import StudentPage from "./pageStudent";
import {Session} from "next-auth";

/**
 * Default session for users no logged in
 */
const DEFAULT_SESSION: Session = {
    user: {
        id: '0',
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

    if (session?.user?.userType == "Instructor")
        return (
            <section
                id={"schedulePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <InstructorPage/>
            </section>
        );
    else
        return (
            <section
                id={"schedulePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <StudentPage/>
            </section>
        );
}

