import { connectRabbitMQ } from "./consumers/consumer.js";
import { startNotificationConsumer } from "./routes/notification.js";

async function start() {
    try {
        await connectRabbitMQ();
        console.log("RabbitMQ connected");
    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }

    try {
        await startNotificationConsumer();
        console.log("Notification consumer started");
    } catch (err) {
        console.error("Failed to start notification consumer:", err);
        process.exit(1);
    }

    console.log("Notification service started");
}

start();
