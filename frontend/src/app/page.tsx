import { Inter } from "next/font/google";
import MainPage from "@/components/MainPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EZMath Application",
  description: "A Math Application by the Mentat Team",
};

const inter = Inter({ subsets: ["latin"] });
/**
 * Main Home page Loader. This is the initial home page
 * @constructor
 */
export default async function Home() {
  return (
    <>
      <main>
        <MainPage />
      </main>
    </>
  );
}
