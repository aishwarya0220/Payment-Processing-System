import { connectRabbitMQ } from "./consumers/consumer.js";

import { startNotificationConsumer } from "./routes/notification.js";

async function start() {
    try{
        await connectRabbitMQ()

        await startNotificationConsumer()

        console.log('Notification service started')
    }catch(err){
        console.error('Failed to start notification service:', err)
        process.exit(1)
    }
}

start()