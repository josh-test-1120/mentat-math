import Footer from "./footer";
import Header from "./header";
import Sidebar from "./sidebar";

export default function Layout({ children }: any) {
  return (
    <>
        {/* @ts-expect-error Async Server Component */}
        <Header />
        <Sidebar />
            {children}
        <Footer />
    </>
  );
}
