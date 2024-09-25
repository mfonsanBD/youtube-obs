import { z } from 'zod';

const envSchema = z.object({
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    NEXTAUTH_SECRET: z.string(),
    OBS_LOCAL_URL: z.string(),
    OBS_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
