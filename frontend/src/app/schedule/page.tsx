import { getServerAuthSession } from "@/utils/auth";
import SchedulesPage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"
import CreateCourse from "@/app/courses/CreateCourse";

/**
 * Backend Server Side Page with AuthProvider session handler
 * injection into Client Side Page
 * @constructor
 */
export default async function Schedule() {
    // Session variable
    const session =  await getServerAuthSession();

    return (

        <AuthProvider session={session}>
            <section
                id={"schedulePageMain"}
                className=" flex font-bold bg-mentat-black text-mentat-gold"
            >
                <SchedulesPage/>
                <CreateCourse/>
            </section>
        </AuthProvider>

    );

}

