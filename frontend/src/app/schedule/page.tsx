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


    // Conditional rendering
    if (session?.user?.userType == "Instructor")
        return (
            <section
                id={"schedulePageMain"}
                className=" flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesInstructor/>
            </section>
        );
    else
        return (
            <section
                id={"schedulePageMain"}
                className=" flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesStudent/>
            </section>
        );
}

