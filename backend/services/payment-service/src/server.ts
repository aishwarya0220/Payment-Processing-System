// index.ts
import app from './app.js';
import 'dotenv/config';
import { connectRedis } from './utils/redis.js';

const startServer = async () => {
    try {
        await connectRedis();
        
        const PORT = process.env.PORT || 3002;
        app.listen(PORT, () => {
            console.log(`Payment service is running on port ${PORT}`);
        });
    } catch (err) {
        console.log('Failed to connect to Redis:', err);
        process.exit(1);
    }
};

startServer();