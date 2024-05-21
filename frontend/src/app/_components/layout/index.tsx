import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: any) {
  return (
    <>
        {/* @ts-expect-error Async Server Component */}
        <Header />
            {children}
        <Footer />
    </>
  );
}
