'use client'

import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

/**
 * AuthProviderProps Interface
 */
interface AuthProviderProps {
    children: React.ReactNode
    session: Session | null
}
export const AuthProvider = ({ children, session }: AuthProviderProps) => {
    return (<SessionProvider session={session}>{children}</SessionProvider>)
}