import "./styles/globals.css";
import Header from "./_components/layout/header";
import Sidebar from "./_components/layout/sidebar";
import Script from "next/script";

export default function RootLayout({
      children,
      session,
    }: {
      children: React.ReactNode;
      session: any;
    }) {

    return (
        <html lang="en">
            {/*Load the Font Awesome Pack*/}
            <Script src="https://kit.fontawesome.com/dad875225f.js" crossOrigin="anonymous" />
            <body>
            <Header/>
            <div className="inline-block w-full">
                <div id="sidebar-box" className="w-1/5 inline-block">
                    <Sidebar/>
                </div>
                <div id="mainbar-box" className="w-4/5 inline-block align-top">
                    {children}
                </div>
            </div>
            </body>
        </html>
    );
}
