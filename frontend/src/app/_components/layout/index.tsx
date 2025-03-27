import Header from "./header";
import Sidebar from "./sidebar";

/**
 * Default Layout
 * @param children
 * @constructor
 */
export default function Layout({ children }: any) {
  return (
    <div className="min-h-screen overflow-auto">
        {/* @ts-expect-error Async Server Component */}
        <Header />
        <div id={"sidebar-box"} className="w-64">
            <Sidebar />
        </div>
        <div id={"mainbar-box"} className="w-auto">
            {children}
        </div>
    </div>
  );
}
