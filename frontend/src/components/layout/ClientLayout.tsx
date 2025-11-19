"use client";
import { useRouter } from "next/navigation";
import {LogOut, Users} from "lucide-react";
import React from "react";

/**
 * Sign Out Button component
 * Navigates to the signout confirmation page instead of signing out directly
 * This ensures the confirmation page always shows up
 * @constructor
 */
export function SignOutButton(){
  // Router to navigate to the signout confirmation page
  const router = useRouter();
  
  // Handle the sign out click
  const handleSignOutClick = () => {
    // Navigate to the signout confirmation page
    router.push('/auth/signout');
  };
  
  // Return the sign out button
  return(
    <button onClick={handleSignOutClick} className="bg-crimson hover:bg-crimson-700
        text-mentat-gold py-2 px-4 rounded-xl shadow-sm shadow-mentat-gold-700
        flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Log out
  </button>
  )
}