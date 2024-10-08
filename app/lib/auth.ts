import { AuthOptions } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { env } from '../types/env';
import { getChannelData } from '../helpers/youtube';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl',
        },
      },
    }),
  ],
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account) {
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
        }
  
        if (profile) {
          token.user = {
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
          };
        }
  
        return token;
      },
    
      async session({ session, token }) {
        session.accessToken = token.accessToken as string;
        session.idToken = token.idToken as string;
        session.user = {
          ...session.user,
          name: token.name,
          email: token.email,
          picture: token.picture,
        };

        // Obter os dados do canal do YouTube
        try {
          const channelData = await getChannelData(token.accessToken as string);
          session.channelData = channelData;  // Adicionar os dados do canal na sessão
        } catch (error) {
          console.error('Erro ao obter os dados do canal do YouTube:', error);
        }
  
        return session;
      },
    },
};