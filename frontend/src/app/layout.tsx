import "./styles/globals.css";
import Header from "./_components/layout/header";
import Footer from "./_components/layout/footer";
import Sidebar from "./_components/layout/sidebar";

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <html lang="en">
        <body>
        {/* @ts-expect-error Props default type */}
        <Header />
        <Sidebar />
          {children}
        <Footer />
        </body>
    </html>
  );
}
