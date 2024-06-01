import Header from "./header";
import Sidebar from "./sidebar";

/**
 * Default Layout
 * @param children
 * @constructor
 */
export default function Layout({ children }: any) {
  return (
    <>
        {/* @ts-expect-error Async Server Component */}
        <Header />
        <div id={"sidebar-box"} className="w-64">
            <Sidebar />
        </div>
        <div id={"mainbar-box"} className="w-auto">
            {children}
        </div>
    </>
  );
}
