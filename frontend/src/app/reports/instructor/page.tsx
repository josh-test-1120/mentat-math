import { getServerAuthSession } from "@/utils/auth";
import InstructorReportPage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"
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

    return (

        <AuthProvider session={session}>
            <section
                id={"schedulePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <InstructorReportPage/>
            </section>
        </AuthProvider>

    );

}

