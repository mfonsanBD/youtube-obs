import OBSWebSocket from 'obs-websocket-js';
import { env } from '../types/env';

const obs = new OBSWebSocket();

// Função para conectar-se ao OBS
export async function connectOBS() {
  try {
    // Conecte-se ao OBS WebSocket
    await obs.connect(env.OBS_LOCAL_URL, env.OBS_PASSWORD);
  } catch (error) {
    throw new Error('Erro ao conectar ao OBS:' + error);
  }
}

// Função para definir a Stream Key no OBS
export async function setStreamKey(streamKey: string) {
  try {
    // Configure a chave de transmissão do YouTube no OBS
    await obs.call('SetStreamServiceSettings', {
      streamServiceType: 'rtmp_custom',
      streamServiceSettings: {
        server: 'rtmp://a.rtmp.youtube.com/live2', // URL do servidor RTMP do YouTube
        key: streamKey, // Chave da transmissão obtida da API do YouTube
      },
    });
  } catch (error) {
    console.error('Erro ao configurar Stream Key:', error);
  }
}

// Função para iniciar o stream no OBS
export async function startStream() {
  try {
    // Inicie a transmissão no OBS
    await obs.call('StartStream');
  } catch (error) {
    console.error('Erro ao iniciar a transmissão:', error);
  }
}