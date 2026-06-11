const redis=require("redis")

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-14691.c8.us-east-1-3.ec2.cloud.redislabs.com',
        port: 14691
    }
});

module.exports = redisClient;

