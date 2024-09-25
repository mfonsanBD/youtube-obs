import { createBroadcast } from '@/app/helpers/youtube';
import { authOptions } from '@/app/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const { title, description } = await req.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
        console.error('Token de acesso não encontrado');
        return;
    }

    try {
        await createBroadcast(session?.accessToken, title, description);

        return new Response(JSON.stringify({ message: 'Transmissão iniciada com sucesso' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Erro ao criar transmissão ao vivo' }), { status: 500 });
    }
}