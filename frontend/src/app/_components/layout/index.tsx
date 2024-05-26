import Footer from "./footer";
import Header from "./header";
import Sidebar from "./sidebar";

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

        {/*<Footer />*/}
    </>
  );
}
