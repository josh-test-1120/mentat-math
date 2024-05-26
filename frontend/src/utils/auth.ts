import NextAuth from "next-auth";

import { NextAuthOptions, getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import apiAuthSignIn from "./api";
import { JWT } from "next-auth/jwt";
import {getSession} from "next-auth/react";

declare module "next-auth" {
    interface User {
        // Add your additional properties here:
        accessToken?: string | null;
    }
}

// declare module "@auth/core/adapters" {
//     interface AdapterUser {
//         // Add your additional properties here:
//         accessToken: string | null;
//     }
// }

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
            scope: "",
            params: { grant_type: "authorization_code" },
            accessTokenUrl: "",
            requestTokenUrl: "",
            authorizationUrl: "",
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
            // Persist the OAuth access_token to the token right after signin
            console.log(`This is the user object: ${user}`)
            console.log(`This is the account object: ${account}`)
            if (account) {
                token.accessToken = user?.accessToken;
                console.log(account.userId);
            }
            if (user) {
                console.log(user.id);
                console.log(user.name);
            }
            console.log('This is the session data');
            session = getSession();
            console.log(session.email);

            if (session) {
                console.log(session.id)
            }
            return user as unknown as JWT;
        },
        /**
         * This is the session handler for the provider
         * that can handle the session before it is returned
         * @param session current session object
         * @param token this is the JWT
         * @param user this is the user object
         */
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            console.log("Session callback");
            console.log(user);
            console.log(session);
            console.log(token);
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