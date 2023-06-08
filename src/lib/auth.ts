// responsible for all the authentication logic

import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google"

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || clientId.length === 0) {
        throw new Error("Missing GOOGLE_CLIENT_ID");
    }
    if (!clientSecret || clientSecret.length === 0) {
        throw new Error("Missing GOOGLE_CLIENT_SECRET");
    }

    return { clientId, clientSecret }
};

export const authOptions: NextAuthOptions = {
    // automatic action to take when a user signs in
    adapter: UpstashRedisAdapter(db),
    // protect the API routes in the middleware 
    session: {
        strategy: 'jwt',
    },
    // pages to redirect to when a user is not signed in
    pages: {
        signIn: '/login',
    },
    // provider for logging in 
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        })
    ],
    // callbacks 
    callbacks: {
        // called when a user signs in
        async jwt ({token, user}) { 
            const dbUser = (await db.get(`user:${token.id}`)) as User || null;
        

            if (!dbUser) {
                token.id = user!.id;
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            }
        },
        async session({session, token}) {
            if(token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }

            return session
        },
        redirect() {
            return '/dashboard'
        }
    }
}