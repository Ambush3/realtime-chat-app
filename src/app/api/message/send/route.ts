import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { Message, messageValidator } from '@/lib/validations/message'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage, Params } from 'multer-storage-cloudinary'

// cloudinary config 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'RealTimeChat',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    },
});

const multerUpload = multer({ storage }).single('media');


export async function POST(req: Request) {
    try {
        await new Promise((resolve, reject) => {
            multerUpload(req, {} as any, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })

        let mediaUrl : string | undefined

        if (req.file) {
            mediaUrl = req.file.path
        }

        const { text, chatId }: { text: string; chatId: string } = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) return new Response('Unauthorized', { status: 401 })

        const [userId1, userId2] = chatId.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', { status: 401 })
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1

        const friendList = (await fetchRedis(
            'smembers',
            `user:${session.user.id}:friends`
        )) as string[]
        const isFriend = friendList.includes(friendId)

        if (!isFriend) {
            return new Response('Unauthorized', { status: 401 })
        }

        const rawSender = (await fetchRedis(
            'get',
            `user:${session.user.id}`
        )) as string
        const sender = JSON.parse(rawSender) as User

        const timestamp = Date.now()

        const messageData = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
            media: mediaUrl || '',
        } as Message

        const message = messageValidator.parse(messageData)

        // notify all connected chat room clients
        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)

        await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
        })

        // all valid, send the message
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message),
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal Server Error', { status: 500 })
    }
}