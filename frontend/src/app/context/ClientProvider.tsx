"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

// interface Props {
//     children?: ReactNode
//     // any props that come into the component
// }

/**
 * Default Client provider for session Provider
 * @param children
 * @param session
 * @constructor
 */
export default function ClientProviders({ children, session }:{ children:React.ReactNode,session:Session}) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}