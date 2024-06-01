"use client";
import { signOut } from "next-auth/react";

/**
 * Handle async call got NextJS logout
 */
const callSignOut = async () => {
  await signOut({
    callbackUrl: `/`,
  });
};

/**
 * Sign Out Button component
 * @constructor
 */
export function SignnOutButton(){
  return(
    <button onClick={callSignOut} className="bg-red-700 hover:bg-red-600 text-yellow-300 py-2 px-4 rounded-xl">
    Sign out
  </button>
  )
}