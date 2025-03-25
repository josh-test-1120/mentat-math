import { getServerAuthSession } from "@/utils/auth";
import CreateCoursePage from "./pageClient";
import { AuthProvider } from "@/components/authProvider"

/**
 * Backend Server Side Page with AuthProvider session handler
 * injection into Client Side Page for CreateCourse page
 * @constructor
 */
export default async function CreateCourse() {
    // Session variable
    const session =  await getServerAuthSession();

    return (
        // Server side authentication part
        <AuthProvider session={session}>
            <section
                id={"createCoursePageMain"}
                className=" font-bold h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold"
            >
                <CreateCoursePage/>
            </section>
        </AuthProvider>

    );

}

