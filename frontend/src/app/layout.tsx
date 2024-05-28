
import "./styles/globals.css";
import Header from "./_components/layout/header";
import Footer from "./_components/layout/footer";
import Sidebar from "./_components/layout/sidebar";
import { createPortal } from 'react-dom'

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
        <Script src={"https://kit.fontawesome.com/dad875225f.js"} crossOrigin={"anonymous"} />
        <body>
        {/* @ts-expect-error Props default type */}
        <Header/>
        <div className="inline-block w-full">
            <div id="sidebar-box" className="w-1/5 inline-block">
                <Sidebar/>
            </div>
            <div id="mainbar-box" className="w-4/5 inline-block align-top">
                {children}
            </div>
        </div>

        {/*<Footer />*/}
        </body>
    </html>
  );
}
