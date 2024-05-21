import { BACKEND_API } from "./constants";
export default async function apiAuthSignIn(credentials: Record<"email" | "username" | "password", string> | undefined) {
    try {
        debugger;
        console.log(credentials);
        console.log(BACKEND_API);
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

        const userID = data.userID;
        return { ...data, userID };
    } catch (error) {
        // return { error: error.message };
        return { error: error };
    }
}

export async function apiHandler(inputs: any | undefined, method: string, uri: string) {
    try {
        const response = await fetch(`${BACKEND_API}/${uri}`, {
            method: `${method}`,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputs as any),
        });

        // Error response from HTTP call
        if (!response.ok) {
            return new Error("Error with POST call");
        }

        const data = await response.json();
        // Handle the errors from the JSON response if the query failed for some reason
        if (data.error) {
            return { error: data.message };
        }
        // Parse the data from the response
        const result = data.data;
        return { ...data, result };
    } catch (error) {
        // return { error: error.message };
        return { error: error };
    }
}

export const BAPI = process.env.BACKEND_SERVER as string;
export const Token = process.env.BEARER as string;