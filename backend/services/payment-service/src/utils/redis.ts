import { createClient } from "redis";

import 'dotenv/config'

const redisClient = createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'})

redisClient.on('error', (err) => console.error('Redis client error:', err))

export const connectRedis = async () => {
    if(!redisClient.isOpen){
        await redisClient.connect()
        console.log('Connected to redis')
    }
}

export const getCachedIdempotency = async (idempotencyKey: string): Promise<string | null> => {
    try{
        return await redisClient.get(idempotencyKey)
    } catch(err){
        console.log('Redis GET Error:', err)
        return null
    }
}

export const setIdempotencyCache = async (idempotencyKey: string, payload: object): Promise<void> => {
    try{
        await redisClient.setEx(idempotencyKey, 3600, JSON.stringify(payload))
    }catch(err){
        console.log('Redis SETEx Error:', err)
    }
}

export default redisClient