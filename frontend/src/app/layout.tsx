import "./styles/globals.css";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Script from "next/script";
import ToastProvider from "@/components/services/ToastProvider";
import { AuthProvider } from "@/components/services/authProvider";
import { getServerAuthSession } from "@/utils/auth";
import { Session } from "next-auth";

const DEFAULT_SESSION: Session = {
  user: {
    id: "",
    username: "Guest",
    email: "",
    userType: "Guest",
  },
  expires: "",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: Session = (await getServerAuthSession()) ?? DEFAULT_SESSION;

  return (
    <html lang="en" className="h-full bg-mentat-black">
      <body className="h-full overflow-auto">
        <Script
          src="https://kit.fontawesome.com/dad875225f.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ToastProvider>
          <AuthProvider session={session}>
            <div className="h-full flex flex-col">
              <Header />
              <div className="flex flex-1 min-h-0">
                <div id="sidebar-box" className="w-64 flex-shrink-0 transition-all duration-300 ease-in-out">
                  <Sidebar />
                </div>
                <div
                  id="mainbar-box"
                  className="flex-1 min-h-0 overflow-auto scrollbar-hide"
                >
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
