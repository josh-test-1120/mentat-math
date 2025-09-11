import { BACKEND_API } from "./constants";
import {getServerSession} from "next-auth";
import {authOptions} from "@/utils/auth";
const getServerAuthSession = () => getServerSession(authOptions);

/**
 * API functions for authenticating sign in
 * @param credentials Record of user attributes
 */
export default async function apiAuthSignIn(credentials: Record<"firstname" | "lastname" | "email" | "username" | "password", string> | undefined) {
    try {
        console.log("🔐 Attempting login with credentials:", { username: credentials?.username, email: credentials?.email });

        // Backend only expects username and password
        const loginData = {
            username: credentials?.username,
            password: credentials?.password
        };

        console.log("�� Sending to backend:", loginData);

        const response = await fetch(`${BACKEND_API}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData as any),
        });

        console.log("📥 Login response status:", response.status);

        //if 401 unauthorized
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Login failed with status:", response.status);
            console.error("❌ Error response:", errorText);
            return null;
        }

        const data = await response.json();
        console.log("📥 Login response data:", data);

        //verify jwt access token
        // const decoded = jwt.verify(data.accessToken, process.env.JWT_SECRET);
        if (data.error) {
            console.error("❌ Backend returned error:", data.message);
            return null;
        }

        // Map backend response to NextAuth user object
        const userData = {
            id: data.id?.toString(), // Convert Long to String
            username: data.username,
            email: data.email,
            accessToken: data.accessToken, // Backend uses 'accessToken'
            roles: data.roles,
            userType: data.userType
        };

        console.log("✅ Mapped user data for NextAuth:", userData);
        return userData;
    } catch (error) {
        console.error("❌ Login error:", error);
        return null;
    }
}

/**
 * API functions for general data calls to backend
 * @param inputs Objects
 */
export async function apiHandler(inputs: any | undefined, method: string, uri: string, backendURL: string) {
    try {
      const url = backendURL ? `${backendURL}/${uri}` : uri;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method !== 'GET' ? { body: JSON.stringify(inputs ?? {}) } : {})
      });
  
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        // Never return Error(); return a structured object
        return { error: true, status: response.status, message: text || `HTTP ${response.status}` };
      }
  
      const data = await response.json().catch(() => ({}));
      // Normalize server-declared errors too
      if (data && data.error) {
        return { error: true, status: 200, message: data.message ?? 'Unknown error', data };
      }
  
      return data; // success
    } catch (e: any) {
      // Network/catch-all path: also return structured error
      return { error: true, status: 0, message: e?.message ?? 'Network error' };
    }
}

export const BAPI = process.env.BACKEND_SERVER as string;
export const Token = process.env.BEARER as string;