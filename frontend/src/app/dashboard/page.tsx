import { getServerAuthSession } from "@/utils/auth";
import MyCoursesPage from "@/app/my-courses/page";
/**
 * Default Dashboard Page
 * @constructor
 */
export default async function Dashboard() {

    return (
        <div className="min-h-screen overflow-auto h-full max-w-screen-2xl px-4 py-8 lg:h-screen bg-mentat-black text-mentat-gold">
            <MyCoursesPage/>
        </div>
    );
}