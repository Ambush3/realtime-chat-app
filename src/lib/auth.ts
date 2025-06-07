import { NextAuthOptions } from 'next-auth';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import { db } from './db';
import GoogleProvider from 'next-auth/providers/google';
import { fetchRedis } from '@/helpers/redis';

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId) throw new Error('Missing GOOGLE_CLIENT_ID');
  if (!clientSecret) throw new Error('Missing GOOGLE_CLIENT_SECRET');
  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  // adapter: UpstashRedisAdapter(db), // Temporarily commented out
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider(getGoogleCredentials()),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in attempt:', { user: user?.email, account: account?.provider });
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback:', { 
        tokenId: token?.id, 
        userId: user?.id, 
        hasAccount: !!account 
      });
      
      if (user) token.id = user.id;
      if (!token.id) return token;
      
      // Skip Redis call while adapter is disabled
      // try {
      //   const dbUserJson = await fetchRedis('get', `user:${token.id}`);
      //   if (!dbUserJson) return token;
      //   
      //   const dbUser = JSON.parse(dbUserJson as string) as User;
      //   return {
      //     ...token,
      //     id: dbUser.id,
      //     name: dbUser.name,
      //     email: dbUser.email,
      //     picture: dbUser.image,
      //   };
      // } catch (error) {
      //   console.error('JWT callback error:', error);
      //   return token;
      // }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      console.log('Redirect called:', { url, baseUrl });
      if (url.startsWith(baseUrl)) {
        return '/dashboard';
      }
      return url;
    },
  },
};
