import { env } from '@/app/types/env';
import OBSWebSocket from 'obs-websocket-js';

export async function GET() {
  const obs = new OBSWebSocket();
  
  try {
    await obs.connect(env.OBS_LOCAL_URL, env.OBS_PASSWORD);
    console.log('Conectado ao OBS via WebSocket!');
  } catch (error) {
    console.error('Erro ao conectar ao OBS:', error);
  }
  
  return new Response(JSON.stringify({ message: 'Transmissão iniciada com sucesso' }), { status: 200 });
}