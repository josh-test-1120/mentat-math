import { getServerAuthSession } from "@/utils/auth";
import SchedulesPage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"

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
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <SchedulesPage/>
            </section>
        </AuthProvider>

    );

}

