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

        const response = await fetch(`${BACKEND_API}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials as any),
        });

        //if 401 unauthorized
        if (!response.ok) {
            return new Error("Invalid credentials");
        }
        const data = await response.json();
        //verify jwt access token
        // const decoded = jwt.verify(data.accessToken, process.env.JWT_SECRET);
        if (data.error) {
            return { error: data.message };
        }

        const userID = data.id;
        return { ...data, userID };
    } catch (error) {
        // return { error: error.message };
        return { error: error };
    }
}
// export default async function apiAuthSignIn(credentials: Record<"firstname" | "lastname" | "email" | "username" | "password", string> | undefined) {
//     try {
//         console.log("🔐 Attempting login with credentials:", { username: credentials?.username, email: credentials?.email });
//
//         // Backend only expects username and password
//         const loginData = {
//             username: credentials?.username,
//             password: credentials?.password
//         };
//
//         console.log("�� Sending to backend:", loginData);
//
//         const response = await fetch(`${BACKEND_API}/api/auth/signin`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(loginData),
//         });
//
//         console.log("📥 Login response status:", response.status);
//
//         //if 401 unauthorized
//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error("❌ Login failed with status:", response.status);
//             console.error("❌ Error response:", errorText);
//             return null;
//         }
//
//         const data = await response.json();
//         console.log("📥 Login response data:", data);
//
//         //verify jwt access token
//         // const decoded = jwt.verify(data.accessToken, process.env.JWT_SECRET);
//         if (data.error) {
//             console.error("❌ Backend returned error:", data.message);
//             return null;
//         }
//
//         // Map backend response to NextAuth user object
//         const userData = {
//             id: data.id?.toString(), // Convert Long to String
//             username: data.username,
//             email: data.email,
//             accessToken: data.accessToken, // Backend uses 'accessToken'
//             roles: data.roles,
//             userType: data.userType
//         };
//
//         console.log("✅ Mapped user data for NextAuth:", userData);
//         return userData;
//     } catch (error) {
//         console.error("❌ Login error:", error);
//         return null;
//     }
// }

/**
 * API functions for general data calls to backend
 * @param inputs Objects
 */
export async function apiHandler(inputs: any | undefined, method: string, uri: string, backendURL: string) {
    try {
        console.log(method);
        console.log(uri);
        console.log(JSON.stringify(inputs as any));
        console.log(`${backendURL}/${uri}`);

        var response;

        var url = "";

        if (backendURL) url = `${backendURL}/${uri}`
        else url = uri;

        console.log(inputs);
        if (method != 'GET'){
            response = await fetch(url, {
                method: `${method}`,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs as any),
            });
        }
        else {
            response = await fetch(url, {
                method: `${method}`,
                headers: {
                    "Content-Type": "application/json",
                }
            });
        }
        console.log('after fetch');

        // Error response from HTTP call
        if (!response.ok) {
            return new Error("Error with POST call");
        }

        console.log('inside API handler');
        const data = await response.json();
        console.log(data);
        // Handle the errors from the JSON response if the query failed for some reason
        if (data.error) {
            return { error: data.message };
        }
        // Parse the data from the response
        const result = data.data;
        console.log({ ...data, result });
        return { ...data, result };
    } catch (error) {
        console.log(error)
        // return { error: error.message };
        return { error: error };
    }
}

export const BAPI = process.env.BACKEND_SERVER as string;
export const Token = process.env.BEARER as string;