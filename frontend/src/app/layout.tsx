import "./styles/globals.css";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/sidebar';
import Script from "next/script";
import ToastProvider from '@/components/services/ToastProvider'
import { AuthProvider } from "@/components/services/authProvider";
import { getServerAuthSession } from "@/utils/auth";
import {Session} from "next-auth";

const DEFAULT_SESSION: Session = {
    user: {
        id: '',
        username: 'Guest',
        email: '',
        userType: 'Guest'
    },
    expires: ''
};

export default async function RootLayout({
    children
}: {
    children: React.ReactNode
}) {

    // Get session server-side
    const session: Session = await getServerAuthSession() ?? DEFAULT_SESSION;

    return (
        <html lang="en" className="h-full bg-mentat-black">
            {/*Load the Font Awesome Pack*/}
            <Script src="https://kit.fontawesome.com/dad875225f.js" crossOrigin="anonymous" />
            <body className="h-full overflow-hidden">
                <ToastProvider>
                    <AuthProvider session={session}>
                        <div className="h-full flex flex-col">
                            <Header/>
                            <div className="flex flex-1 overflow-hidden">
                                <div id="sidebar-box" className="w-64 flex-shrink-0">
                                    <Sidebar/>
                                </div>
                                <div id="mainbar-box" className="flex-1 overflow-hidden">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
