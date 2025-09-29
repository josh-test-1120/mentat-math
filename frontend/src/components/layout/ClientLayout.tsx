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
export function SignOutButton(){
  return(
    <button onClick={callSignOut} className="bg-crimson hover:bg-crimson-700 text-mentat-gold py-2 px-4 rounded-xl">
    Sign out
  </button>
  )
}