import {
    getRabbitMQChannel,
    QUEUE_NAME
} from "../consumers/consumer.js";

interface PaymentSucceededEvent {
    payment_id: string
    order_id: string
    amount: string
    status: string
}

export async function startNotificationConsumer() {
    const channel = getRabbitMQChannel()

    console.log('Starting notification consumer...')
    console.log('Queue:', QUEUE_NAME)

    await channel.consume(
        QUEUE_NAME,
        async (message) => {
            if (!message) return

            try {
                const event = JSON.parse(
                    message.content.toString()
                ) as PaymentSucceededEvent

                console.log('Received payment.succeeded:', event)

                await handlePaymentSucceeded(event)

                channel.ack(message)

            } catch (err) {
                console.error(
                    'Failed to process notification events:',
                    err
                )

                channel.nack(
                    message,
                    false,
                    true
                )
            }
        }
    )

    console.log(`Listening on ${QUEUE_NAME}`)
}

async function handlePaymentSucceeded(
    event: PaymentSucceededEvent
) {
    console.log(`\n----------------------------------------`)
    console.log(`[MOCK EMAIL SENT] 📧`)
    console.log(`To User for Order ID: ${event.order_id}`)
    console.log(`Payment ID: ${event.payment_id}`)
    console.log(`Amount Charged: $${event.amount}`)
    console.log(`Status: ${event.status}`)
    console.log(`----------------------------------------\n`)
}
