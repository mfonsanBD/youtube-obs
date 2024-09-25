/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis';
import { env } from '../types/env';
import { connectOBS, setStreamKey, startStream } from './obs';
const youtube = google.youtube('v3');

export async function createBroadcast(accessToken: string, title: string, description: string) {
  const auth = new google.auth.OAuth2({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback',
  });

  auth.setCredentials({ access_token: accessToken, scope: 'https://www.googleapis.com/auth/youtube.force-ssl' });

  // Cria uma transmissão
  const broadcast = await youtube.liveBroadcasts.insert({
    auth,
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        scheduledStartTime: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    },
  });
  
  // Cria o stream
  const stream = await youtube.liveStreams.insert({
    auth,
    part: ['snippet', 'cdn', 'status'],
    requestBody: {
      snippet: {
        title: 'Live Stream',
      },
      cdn: {
        format: '1080p',
        ingestionType: 'rtmp',
        resolution: '1080p',
        frameRate: '30fps',
      },
    },
  });
  
  // Vincular transmissão e stream
  await youtube.liveBroadcasts.bind({
    auth,
    id: broadcast.data.id as string,
    part: ['id', 'snippet'],
    streamId: stream.data.id as string,
  });

  await connectOBS(); // Conectar ao OBS
  await setStreamKey(stream.data.cdn?.ingestionInfo?.streamName as string); // Configurar a Stream Key do YouTube
  await startStream(); // Iniciar a transmissão no OBS

  await new Promise(() => setTimeout(() => {
    youtube.liveBroadcasts.transition({
      auth,
      broadcastStatus: 'live',
      id: broadcast.data.id as string,
      part: ['id', 'snippet', 'status'],
    })
  }, 5 * 60 * 1000))
}

