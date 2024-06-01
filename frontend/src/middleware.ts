import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
// import { verifyToken } from "./auth"; // Assuming you have an authentication function

/**
 * Middleware functions for NextJS
 * @param req NextRequest
 * @param event NextFetchEvent
 */
export function middleware(req: NextRequest, event: NextFetchEvent) {
    try {
        const token = req.cookies.get("next-auth.session-token");

        if (!token?.value) {
            // Authentication failed
            return NextResponse.redirect(new URL("/auth/login", req.url)); // Redirect to login
        }

        // Authentication successful, continue to the requested page
        //return NextResponse.next();

        // retrieve the current response
        const res = NextResponse.next()

        // add the CORS headers to the response
        res.headers.append('Access-Control-Allow-Credentials', "true")
        res.headers.append('Access-Control-Allow-Origin', '*') // replace this your actual origin
        res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
        res.headers.append(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )

        return res
    } catch (error) {
        // Handle authentication errors
        console.error("Authentication error:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred during authentication." },
            { status: 401 }
        );
    }
}

/**
 * Matcher for routing middleware
 */
export const config = {
    matcher: "/(dashboard|grades|schedule|reports/instructor)/:path",
};