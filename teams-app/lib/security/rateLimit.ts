import redis from "../redis";

export async function rateLimit({
    key,
    limit,
    windowInSeconds
}:{
    key: string,
    limit: number
    windowInSeconds: number
}) {
    const current = await redis.incr(key)
    if(current === 1){
        await redis.expire(key, windowInSeconds)
    }
    if(current > limit){
        return {
            allowed: false,
            remaining: 0
        }
    }

    return {
        allowed: true,
        remaining: limit - current
    }
}