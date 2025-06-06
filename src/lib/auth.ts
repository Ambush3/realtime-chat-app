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
  adapter: UpstashRedisAdapter(db),
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
  },

  providers: [
    GoogleProvider(getGoogleCredentials()),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (!token.id) return token;
      
      try {
        const dbUserJson = await fetchRedis('get', `user:${token.id}`);
        if (!dbUserJson) return token;
        
        const dbUser = JSON.parse(dbUserJson as string) as User;
        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
        };
      } catch (error) {
        console.error('JWT callback error:', error);
        // Return token without DB data if Redis fails
        return token;
      }
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

    redirect() {
      return '/dashboard';
    },
  },
};
