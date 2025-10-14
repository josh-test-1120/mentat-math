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
            <head>
                {/* Initialize global namespace immediately to prevent undefined access */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            // Ensure window exists (client-side only)
                            if (typeof window !== 'undefined') {
                                // Initialize globals immediately
                                window.MENTAT = window.MENTAT || {};
                                window.MENTAT.toggle = window.MENTAT.toggle || function(){};
                                window.MENTAT.setToggle = window.MENTAT.setToggle || function(){};
                                window.toggle = window.toggle || function(){};
                                window.setToggle = window.setToggle || function(){};
                                
                                // Override the global setToggle function to prevent errors
                                window.setToggle = function(obj, toggleFn) {
                                    if (obj === undefined || obj === null) {
                                        console.warn('setToggle called on undefined/null object, ignoring');
                                        return;
                                    }
                                    if (typeof obj === 'object' && obj !== null) {
                                        obj.toggle = toggleFn || function(){};
                                    }
                                };
                                
                                console.log('MENTAT global initialized with setToggle protection');
                                
                                // Add comprehensive error handling
                                window.addEventListener('error', function(e) {
                                    if (e.message && e.message.includes('toggle')) {
                                        console.warn('Toggle error caught:', e.message);
                                        console.warn('Error details:', e);
                                        // Prevent the error from propagating
                                        e.preventDefault();
                                        return false;
                                    }
                                });
                                
                                // Also catch unhandled promise rejections
                                window.addEventListener('unhandledrejection', function(e) {
                                    if (e.reason && e.reason.message && e.reason.message.includes('toggle')) {
                                        console.warn('Toggle promise rejection caught:', e.reason.message);
                                        e.preventDefault();
                                    }
                                });
                            }
                        })();
                    `
                }} />
            </head>
            <body className="h-full overflow-auto">
                {/* Backup initialization with Script component */}
                <Script id="mentat-init" strategy="beforeInteractive">{`
                    (function() {
                        if (typeof window !== 'undefined') {
                            window.MENTAT = window.MENTAT || {};
                            window.MENTAT.toggle = window.MENTAT.toggle || function(){};
                            window.MENTAT.setToggle = window.MENTAT.setToggle || function(){};
                            window.toggle = window.toggle || function(){};
                            window.setToggle = window.setToggle || function(){};
                            console.log('MENTAT global initialized via Script');
                        }
                    })();
                `}</Script>
                {/*Load the Font Awesome Pack - after our initialization */}
                <Script 
                    src="https://kit.fontawesome.com/dad875225f.js" 
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                {/* Ensure globals exist after Font Awesome loads */}
                <Script id="post-fontawesome-init" strategy="afterInteractive">{`
                    (function() {
                        if (typeof window !== 'undefined') {
                            // Re-initialize globals after Font Awesome loads
                            window.MENTAT = window.MENTAT || {};
                            window.MENTAT.toggle = window.MENTAT.toggle || function(){};
                            window.MENTAT.setToggle = window.MENTAT.setToggle || function(){};
                            window.toggle = window.toggle || function(){};
                            window.setToggle = window.setToggle || function(){};
                            console.log('Post-FontAwesome global initialization complete');
                        }
                    })();
                `}</Script>
                <ToastProvider>
                    <AuthProvider session={session}>
                        <div className="h-full flex flex-col">
                            <Header/>
                            <div className="flex flex-1 min-h-0">
                                <div id="sidebar-box" className="w-64 flex-shrink-0">
                                    <Sidebar/>
                                </div>
                                <div id="mainbar-box" className="flex-1 min-h-0 overflow-auto">
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
