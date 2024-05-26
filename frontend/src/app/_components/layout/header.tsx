import Link from "next/link";
import {  SignnOutButton } from "./ClientLayout";
import { getServerAuthSession } from "@/utils/auth";


export default async function Header() {
  const session = await getServerAuthSession();

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-red-700 via-zinc-900 to-neutral-950 py-4 px-6 border-b-4 border-stone-400">
      <Link href="/" className="text-2xl font-bold text-gray-800">

      </Link>

      <div className="flex items-center space-x-4">
  {session ? (
    <>
      <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 border border-gray-300 text-yellow-300 font-bold rounded-xl">
        Dashboard
      </Link>
      <SignnOutButton />
    </>
  ) : (
    <>
      <Link href="/auth/signin" className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 border border-gray-300 text-amber-400 font-bold rounded-xl">
        Log in
      </Link>
      <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 border border-gray-300 text-yellow-300 font-bold rounded-xl">
        Sign up
      </Link>
    </>
  )}
</div>
    </header>
  );
}