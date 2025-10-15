import NextAuth from "next-auth";

import { NextAuthOptions, getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import apiAuthSignIn from "./api";
import { JWT } from "next-auth/jwt";
import {getSession} from "next-auth/react";

/**
 * Declare the authentication interfaces for the objects
 */
declare module "next-auth" {
    interface User {
        // Add your additional properties here:
        accessToken?: string | null;
        id?: string | null;
        roles? : string[] | null;
        username? : string | null;
        userType? : string | null;
    }
    interface Session {
        // Add your additional properties here:
        user: {
            id?: string | null;
            roles?: string[] | null;
            username?: string | null;
            email?: string | null;
            accessToken?: string | null;
            userType? : string | null;
            name?: string | null;
        }
        expires: string;
    }
}

/**
 * NextJS Authentication Options custom provider handlers
 */
export const authOptions:NextAuthOptions = {
    providers: [
        /**
         * Future Function for handling CWU federated api login
         */
        {
            id: "cwuidp",
            name: "Central Washington University",
            type: "oauth",
            version: "2.0",
            authorization: {
                params: {
                    grant_type: "authorization_code",
                    scope: "",
                    url: ""
                }
            },
            accessTokenUrl: "",
            requestTokenUrl: "",
            profileUrl: "",
            async profile(profile, tokens) {
                // You can use the tokens, in case you want to fetch more profile information
                // For example several OAuth providers do not return email by default.
                // Depending on your provider, will have tokens like `access_token`, `id_token` and or `refresh_token`
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture
                }
            },
            clientId: "",
            clientSecret: ""
        },
        /**
         * Current local authentication with credentials
         */
        CredentialsProvider({
            name: "credentials",
            credentials: {
                firstname: {label: "Firstname", type: "text"},
                lastname: {label: "Lastname", type: "text"},
                username: { label: "Username", type: "text"},
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"firstname" | "lastname" | "email" | "username" | "password", string> | undefined) {
                if (!credentials) {
                    throw new Error("Invalid credentials");
                }
                const user = await apiAuthSignIn(credentials);
                // Print statement
                console.log({user});

                return user;
            },
        }),
    ],
    callbacks: {
        /**
         * This is the JSON Web Token (JWT) handler for the provider
         * that will persist the token to the user after signin
         * @param token this is the JWT
         * @param account this is the account object
         * @param user this is the user object
         */
        async jwt({ token, account, user, trigger, isNewUser,session }) {
            console.log("JWT callback - trigger:", trigger);
            console.log("JWT callback - user data:", user);
            console.log("JWT callback - existing token:", token);
            
            // Persist the OAuth access_token to the token right after signin
            if (user) {
                console.log("JWT callback - user data:", user);
                
                // Persist the access token
                token.accessToken = user?.accessToken;
                // Persist the user ID to the token
                token.id = user?.id;
                // Persist the roles
                token.roles = user?.roles;
                // Persist the First name of the user
                token.username = user?.username;
                // Persist the User Type
                token.userType = user.userType;
                // Store login timestamp for session management
                token.loginTime = Date.now();
                
                console.log("JWT callback - token after update:", token);
            }
            
            // Check if token is expired and refresh it automatically
            if (token.accessToken && typeof token.accessToken === 'string') {
                try {
                    const payload = JSON.parse(Buffer.from(token.accessToken.split('.')[1], 'base64').toString());
                    const isExpired = Date.now() >= payload.exp * 1000;
                    
                    if (isExpired) {
                        console.log("JWT callback - token expired");
                        
                        // Check if session is still within reasonable time (e.g., 7 days)
                        const sessionAge = Date.now() - (token.loginTime as number || 0);
                        const maxSessionAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
                        
                        if (sessionAge < maxSessionAge) {
                            console.log("JWT callback - session is still valid, but token expired. User needs to re-authenticate.");
                            // For now, we'll clear the token to force re-authentication
                            // In production, we might want to implement a refresh token mechanism
                            token.accessToken = null;
                        } else {
                            console.log("JWT callback - session expired, clearing all data");
                            token.accessToken = null;
                            token.loginTime = null;
                        }
                    } else {
                        console.log("JWT callback - token is still valid");
                    }
                } catch (e) {
                    console.error("JWT callback - error parsing token:", e);
                    token.accessToken = null;
                }
            }
            
            // Ensure accessToken is preserved during session refreshes
            if (trigger === "update" && session?.accessToken) {
                console.log("JWT callback - preserving accessToken during update");
                token.accessToken = session.accessToken;
            }
            
            console.log("JWT callback - final token:", token);
            return token;
        },
        /**
         * This is the session handler for the provider
         * that can handle the session before it is returned
         * @param session current session object
         * @param token this is the JWT
         * @param user this is the user object
         */
        async session({ session, token, user }) {
            console.log("Session callback - token data:", token);
            console.log("Session callback - initial session:", session);
            
            // Send properties to the client, like an access_token from a provider.
            // Add the token ID to the session
            const userID = token.id && (typeof token.id === 'string' || typeof token.id === 'number');
            session.user.id = userID ? String(token.id) : null;
            
            // Add the token roles to the session
            if (Array.isArray(token.roles) && token.roles.every(item => typeof item === 'string')) {
                session.user.roles = token.roles
            }
            else session.user.roles = null
            
            // Add the token username to the session
            session.user.username = typeof token.username === 'string' ? token.username: null;
            
            // Add the token email to the session - FIXED: was missing proper null check
            session.user.email = typeof token.email === 'string' ? token.email : null;
            
            session.user.accessToken = typeof token.accessToken === 'string' ? token.accessToken: null;
            
            // Add the userType to session
            session.user.userType = typeof token.userType === 'string' ? token.userType : null;

            console.log("Session callback - final session:", session);
            return session;
        },
    },
    /**
     * Details for the session handler
     */
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // Maximum session age in seconds (30 days)
    },
    /**
     * pages that are assigned to the provider
     */
    pages: {
        // signIn: "/auth/signin",
    },
    /**
     * This is the JWT secret token used for headless API authentication
     * This is for NextJS to Spring Boot trust
     */
    jwt: {
        secret: process.env.NEXT_JWT_SECRET as string,
    },
    /**
     * This is the default JWT and hash signer for NextJS and Express (Node)
     */
    secret: process.env.NEXTAUTH_SECRET as string,
};
/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);