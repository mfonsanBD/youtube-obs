/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';
import { ChannelData } from './channelData';

declare module "next-auth" {
    interface Profile {
      picture?: string;
    }
  
    interface Session {
      accessToken?: string;
      idToken?: string;
      channelData: ChannelData;
      user: {
        name?: string;
        email?: string;
        picture?: string;
      } & DefaultSession["user"];
    }
  
    interface JWT {
      accessToken?: string;
      idToken?: string;
    }
  }