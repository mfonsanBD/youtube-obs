/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis';
import { env } from '../types/env';
import { connectOBS, setStreamKey, startStream } from './obs';
const youtube = google.youtube('v3');

let broadcastStatusData: string = 'created'
let streamStatusData: string = 'inactive'
let streamHealthStatusData: string = 'noData'

export async function createGoogleAuth() {
  return new google.auth.OAuth2({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback',
  });
}

export async function createBroadcast(accessToken: string, title: string, description: string) {
  const auth = await createGoogleAuth()
  auth.setCredentials({ access_token: accessToken, scope: 'https://www.googleapis.com/auth/youtube.force-ssl' })

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

  const checkStatusInterval = setInterval(async () => {
    const broadcastStatus = await youtube.liveBroadcasts.list({
      auth,
      id: [broadcast.data.id as string],
      part: ['status'],
    });
  
    const streamStatus = await youtube.liveStreams.list({
      auth,
      id: [stream.data.id as string],
      part: ['status'],
    });
  
    broadcastStatusData = broadcastStatus!.data!.items![0].status?.lifeCycleStatus as string;
    streamStatusData = streamStatus!.data!.items![0].status?.streamStatus as string;
    streamHealthStatusData = streamStatus!.data!.items![0].status?.healthStatus?.status as string;
  
    console.log('Broadcast Status:', broadcastStatusData);
    console.log('Stream Status:', streamStatusData);
    console.log('Stream Health Status:', streamHealthStatusData);
  
    // Se tudo estiver em ordem, faça a transição para "live"
    if (
      broadcastStatusData === 'testing' &&
      streamStatusData === 'active' &&
      streamHealthStatusData === 'good'
    ) {
      try {
        await youtube.liveBroadcasts.transition({
          auth,
          broadcastStatus: 'live',
          id: broadcast.data.id as string,
          part: ['id', 'snippet', 'status'],
        });
        console.log('Transmissão ao vivo iniciada!');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.error('Erro ao fazer a transição:');
      }

      clearInterval(checkStatusInterval); // Pare o intervalo após a transição bem-sucedida
    }
  }, 5000)
}

export async function endBroadcast(accessToken: string, broadcastId: string) {
  const auth = await createGoogleAuth()
  auth.setCredentials({ access_token: accessToken, scope: 'https://www.googleapis.com/auth/youtube.force-ssl' })

  try {
    // Transicionar a transmissão para "complete"
    await youtube.liveBroadcasts.transition({
      auth,
      broadcastStatus: 'complete',
      id: broadcastId,
      part: ['id', 'snippet', 'status'],
    });
    console.log('Transmissão encerrada com sucesso!');
  } catch (error) {
    console.error('Erro ao encerrar a transmissão:', error);
  }
}

export async function getChannelData(accessToken: string) {
  try {
    const auth = await createGoogleAuth()
    auth.setCredentials({ access_token: accessToken, scope: 'https://www.googleapis.com/auth/youtube.force-ssl' })

    // Fazer a requisição para obter os dados do canal do usuário autenticado
    const response = await youtube.channels.list({
      auth,
      part: ['snippet','contentDetails','statistics'],
      mine: true,  // Pega o canal do usuário autenticado
    })
    
    // Retornar os dados do canal
    return response.data.items![0]
  } catch (error) {
    console.error('Error fetching YouTube channel data:', error)
    throw new Error('Failed to fetch YouTube channel data')
  }
}

