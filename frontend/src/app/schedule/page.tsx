import { getServerAuthSession } from "@/utils/auth";
import SchedulesInstructor from "./pageInstructor";
import SchedulesStudent from "./pageStudent";
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
export default async function Schedule() {
    // Session variable
    const session =  await getServerAuthSession() ?? DEFAULT_SESSION;

    // Debug logging
    console.log("Schedule page - Session data:", session);
    console.log("Schedule page - User type:", session?.user?.userType);
    console.log("Schedule page - User ID:", session?.user?.id);

    // Conditional rendering
    if (session?.user?.userType == "Instructor") {
        console.log("Schedule page - Rendering Instructor component");
        return (
            <section
                id={"schedulePageMain"}
                className="h-full w-full flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesInstructor/>
            </section>
        );
    } else {
        console.log("Schedule page - Rendering Student component");
        return (
            <section
                id={"schedulePageMain"}
                className="h-full w-full flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesStudent/>
            </section>
        );
    }
}

