import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request ) {
    try {
        const body = await req.json()

        const { id: idToAdd } = z.object ({ id: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if(!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // verify that both users are not already friends 
        const isAlreadyFriends = await fetchRedis(
            'sismember', 
            `user:${session.user.id}:friends`, 
            idToAdd
        )

        if(isAlreadyFriends) {
            return new Response('Already friends', { status: 400 })
        }

        // only allow the user to add friends that have sent them a friend request
        const hasFriendRequest = await fetchRedis('sismember',
        `user:${session.user.id}:incoming_friend_requests`, idToAdd)

        if(!hasFriendRequest) {
            return new Response('No friend request', { status: 400 })
        }

        await db.sadd(`user:${session.user.id}:friends`, idToAdd)

        await db.sadd(`user:${idToAdd}:friends`, session.user.id)

        // clean up friend request
        await db.srem(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        // future outbound friend requests
        // await db.srem(`user:${idToAdd}:outgoing_friend_requests`, idToAdd)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)

        // need this to get rid of 500 response
        return new Response('ok')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid Request Payload', { status: 422 })
        }

        return new Response('Invalid Request', { status: 400 })
    }
}