import { getServerAuthSession } from "@/utils/auth";
import SchedulesInstructor from "./pageInstructor";
import SchedulesStudent from "./pageStudent";
import { AuthProvider } from "@/components/authProvider"
import {Session} from "next-auth";
import InstructorCoursesClient from "@/app/instructorCourses/pageClient";

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


    // Conditional rendering
    if (session.user.userType == "Instructor")
        return (
            <AuthProvider session={session}>
                <section
                    id={"schedulePageMain"}
                    className=" flex font-bold bg-mentat-black text-mentat-gold"
                >
                    <SchedulesInstructor/>
                </section>
            </AuthProvider>
        );
    else
        return (
        <AuthProvider session={session}>
            <section
                id={"schedulePageMain"}
                className=" flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesStudent/>
            </section>
        </AuthProvider>
    );

}

