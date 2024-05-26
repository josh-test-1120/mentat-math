import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MainPage from "@/components/MainPage";
import Services from "@/app/_components/home/serviceMain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EZMath Application",
  description: "A Math Application by the Mentat Team",
};

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  return (
    <>
      <main>
        <MainPage />
        <Services />
      </main>
    </>
  );
}
