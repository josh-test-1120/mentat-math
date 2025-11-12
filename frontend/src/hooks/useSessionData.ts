/**
 * This component will be used to handle authentication
 * serialization into an object that represents
 * the session information of the logged-in user
 *
 * This is used in pages that required valid user information
 * to render the page properly
 * @author Joshua Summers
 */

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

/**
 * This is the interface to use for session
 * object hydration
 */
export interface UserSession {
    id: string;
    username: string;
    email: string;
    accessToken: string;
}

/**
 * This hook will get the session data, and return that information
 * to the page as state variables
 */
export const useSessionData = () => {
    const { data: session, status } = useSession();
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setUserSession] = useState<UserSession>({
        id: '',
        username: '',
        email: '',
        accessToken: '',
    });

    /**
     * Initial session hydration
     */
    useEffect(() => {
        if (status !== "authenticated" || !session) return;

        const newUserSession = {
            id: session?.user.id?.toString() || '',
            username: session?.user.username || '',
            email: session?.user.email || '',
            accessToken: session?.user.accessToken || '',
        };

        setUserSession(newUserSession);
        setSessionReady(newUserSession.id !== "");
    }, [session, status]);

    // Return the states for handling in rendering
    return { userSession, sessionReady, status };
};