/* eslint-disable @next/next/no-img-element */
'use client'

import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const handleCreateTransmission = async () => {
    const data = {
      title: 'Teste', 
      description: 'Descrição da live'
    }

    await axios.post('/api/live', data)
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-32">
      {session ? (
        <div className="flex flex-col items-center space-y-4">
          <img src={session.channelData.image} alt={session.channelData.name} className="w-16 h-16 rounded-full" />
          <div className="flex items-center gap-4">
            <p>Inscritos: {session.channelData.subscribers}</p>
            <p>Vídeos: {session.channelData.videos}</p>
            <p>Visualizações: {session.channelData.views}</p>
          </div>

          <div className="w-1/2 flex flex-col items-center gap-4">
            <p>{session.channelData.name} - {session.channelData.username}</p>
            <p>{session.channelData.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-emerald-500" onClick={handleCreateTransmission}>Criar Transmissão</button>
            <button className="text-red-500" onClick={() => signOut()}>Sair da Conta</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <button onClick={() => signIn('google')}>Login com Google</button>
          <button onClick={() => signOut()}>Deslogar</button>
        </div>
      )}
    </div>
  );
}
