const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN

type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
   command: Command,
   ...args: (string | number)[]
) {
   const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`
   
   const redisCall = fetch(commandUrl, {
       headers: {
           Authorization: `Bearer ${authToken}`,
       },
       cache: 'no-store',
   }).then(async (response) => {
       if (!response.ok) {
           throw new Error(`Error executing Redis command: ${response.statusText}`)
       }
       const data = await response.json()
       return data.result
   })

   const timeoutPromise = new Promise((_, reject) => 
       setTimeout(() => reject(new Error(`Redis ${command} command timed out after 5 seconds`)), 5000)
   )
   
   try {
       return await Promise.race([redisCall, timeoutPromise])
   } catch (error) {
       console.error(`Redis ${command} error:`, error)
       throw error
   }
}
