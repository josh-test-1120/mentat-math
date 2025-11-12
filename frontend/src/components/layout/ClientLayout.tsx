"use client";
import { signOut } from "next-auth/react";
import {LogOut, Users} from "lucide-react";
import React from "react";

/**
 * Handle async call got NextJS logout
 */
const callSignOut = async () => {
  await signOut({
    callbackUrl: `/auth/signin/`,
  });
};

/**
 * Sign Out Button component
 * @constructor
 */
export function SignOutButton(){
  return(
    <button onClick={callSignOut} className="bg-crimson hover:bg-crimson-700
        text-mentat-gold py-2 px-4 rounded-xl shadow-sm shadow-mentat-gold-700
        flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Log out
  </button>
  )
}