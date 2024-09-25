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
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <p>Bem-vindo, {session.user?.name}!</p>
            <button onClick={() => signOut()}>Logout</button>
          </div>

          <button onClick={handleCreateTransmission}>Criar Transmissão</button>
        </div>
      ) : (
        <button onClick={() => signIn('google')}>Login com Google</button>
      )}
    </div>
  );
}
