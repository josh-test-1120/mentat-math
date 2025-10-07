import { getServerAuthSession } from "@/utils/auth";
import InstructorsPage from "./pageInstructor";
import StudentsPage from "./pageStudent";
import { Session } from "next-auth";

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
    console.log("Schedule page - Session data:", JSON.stringify(session, null, 2));
    console.log("Schedule page - User type:", session?.user?.userType);
    console.log("Schedule page - User ID:", session?.user?.id);
    console.log("Schedule page - Access Token:", session?.user?.accessToken ? 'Present' : 'Missing');
    console.log("Schedule page - Access Token length:", session?.user?.accessToken?.length || 0);

    return (
        <section
            id={"schedulePageMain"}
            className="h-full w-full flex font-bold bg-mentat-black text-mentat-gold"
        >
            {/*Conditional Rendering*/}
            {session?.user?.userType == "Instructor" ?
                (<InstructorsPage />) : (<StudentsPage />)}
        </section>
    );
}

