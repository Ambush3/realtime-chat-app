import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { Message, messageValidator } from '@/lib/validations/message'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
    try {
        const { text, chatId, imageUrl }: { text: string; chatId: string; imageUrl: string } = await req.json()
        
        console.log('=== MESSAGE SEND DEBUG ===');
        console.log('Payload:', { text, chatId, imageUrl });
        
        const session = await getServerSession(authOptions)
        console.log('Session:', JSON.stringify(session, null, 2));
        
        if (!session) {
            console.log('No session found');
            return new Response('Unauthorized', { status: 401 })
        }
        
        const [userId1, userId2] = chatId.split('--')
        console.log('Chat participants:', { userId1, userId2 });
        console.log('Session user ID:', session.user.id);
        console.log('User ID type:', typeof session.user.id);
        console.log('userId1 type:', typeof userId1);
        
        if (session.user.id !== userId1 && session.user.id !== userId2) {
            console.log('User not in chat. Session ID:', session.user.id, 'Chat IDs:', userId1, userId2);
            return new Response('Unauthorized', { status: 401 })
        }
        
        const friendId = session.user.id === userId1 ? userId2 : userId1
        console.log('Friend ID:', friendId);
        
        const friendList = (await fetchRedis(
            'smembers',
            `user:${session.user.id}:friends`
        )) as string[]
        console.log('Friend list:', friendList);
        console.log('Is friend included?', friendList.includes(friendId));
        
        const isFriend = friendList.includes(friendId)
        if (!isFriend) {
            console.log('Not friends');
            return new Response('Unauthorized', { status: 401 })
        }
        
        const rawSender = (await fetchRedis(
            'get',
            `user:${session.user.id}`
        )) as string
        console.log('Raw sender found:', !!rawSender);
        
        const sender = JSON.parse(rawSender) as User
        const timestamp = Date.now()
        const messageData = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
            imageUrl,
        } as Message
        
        console.log('Message data:', messageData);
        
        const message = messageValidator.parse(messageData)
        console.log('✅ Message validated successfully');
        
        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)
        await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
        })
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message),
        })
        
        console.log('✅ Message sent successfully');
        return new Response('OK')
    } catch (error) {
        console.error('Message send error:', error);
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }
        return new Response('Internal Server Error', { status: 500 })
    }
}
