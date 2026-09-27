
import app from './app.js';

import 'dotenv/config';

import { connectRedis } from './utils/redis.js';

import { connectRabbitMQ } from './utils/rabbitmq.js';

import { processOutbox } from './workers/outbox.worker.js';

const startServer = async () => {
    try {
        await connectRedis();

        await connectRabbitMQ();
        
        const PORT = process.env.PORT || 3002;
        app.listen(PORT, () => {
            console.log(`Payment service is running on port ${PORT}`);
        });

        setInterval(async () => {
            try{
                await processOutbox()
            }catch(err){
                console.error('Outbox worker error', err)
            }
        }, 1000)
    } catch (err) {
        console.log('Failed to connect to Redis:', err);
        process.exit(1);
    }
};

startServer();