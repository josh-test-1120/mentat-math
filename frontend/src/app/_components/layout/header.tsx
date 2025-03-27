import Link from "next/link";
import {  SignnOutButton } from "./ClientLayout";
import { getServerAuthSession } from "@/utils/auth";

/**
 * Default Header used in default Layout
 * @constructor
 */
export default async function Header() {
    const session = await getServerAuthSession();
    let currDate = new Date().toLocaleDateString();
    let currTime = new Date().toLocaleTimeString();

  return (
      <header
          className="flex justify-between items-center bg-gradient-to-r
          from-red-700 via-zinc-900 to-neutral-950 py-4 px-6 border-b-4
          border-stone-400">
          <div className="text-mentat-gold">
              <div>Today&#39;s Date: <span id="date">{currDate}</span></div>
              <div>Current Time: <span id="time">{currTime}</span></div>
          </div>
          {session ? (
              <div className="text-mentat-gold rounded shadow">
                  <p>Email: {session?.user?.email}</p>
                  <p>Username: {session?.user?.username}</p>
                  {/*<p>User Type: {session.user}</p>*/}
              </div>
          ) : (
              <></>
          )}
              <div className="flex items-center space-x-4">
                  {session ? (
                      <>
                          <Link href="/dashboard"
                                className="text-yellow-300 bg-red-700 hover:bg-red-600 py-2 px-4 rounded-xl">
                              Dashboard
                          </Link>
                          <SignnOutButton/>
                      </>
                  ) : (
                      <>
                          <Link href="/auth/signin"
                                className="text-yellow-300 bg-red-700 hover:bg-red-600 py-2 px-4 rounded-xl">
                              Log in
                          </Link>
                          <Link href="/auth/signup"
                                className="text-yellow-300 bg-red-700 hover:bg-red-600 py-2 px-4 rounded-xl">
                              Sign up
                          </Link>
                      </>
                  )}
              </div>
      </header>
);
}