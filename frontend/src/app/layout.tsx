import "./styles/globals.css";
import Header from "./_components/layout/header";
import Sidebar from "./_components/layout/sidebar";
import Script from "next/script";
import ToastProvider from '@/components/ToastProvider'

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
            <body className="h-screen overflow-hidden">
                <ToastProvider>
                    <div className="h-screen flex flex-col">
                        <Header/>
                        <div className="flex flex-1 overflow-hidden">
                            <div id="sidebar-box" className="w-64 flex-shrink-0">
                                <Sidebar/>
                            </div>
                            <div id="mainbar-box" className="flex-1 overflow-auto">
                                {children}
                            </div>
                        </div>
                    </div>
                </ToastProvider>
            </body>
        </html>
    );
}
