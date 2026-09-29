import amqp, { type Channel, type ChannelModel } from 'amqplib'

import 'dotenv/config'

const RABBITMQ_URL = `amqp://admin:admin123@${process.env.RABBITMQ_HOST || 'localhost'}:5672`;

const EXCHANGE_NAME = 'payment.events'

const QUEUE_NAME = 'notification.queue'

let connection: ChannelModel

let channel: Channel

export async function connectRabbitMQ() {
    connection = await amqp.connect(RABBITMQ_URL)

    channel = await connection.createChannel()

    await channel.assertExchange(
        EXCHANGE_NAME,
        'topic',
        {
            durable: true
        }
    )

    await channel.assertQueue(
        QUEUE_NAME,
        {
            durable: true
        }
    )

    await channel.bindQueue(
        QUEUE_NAME,
        EXCHANGE_NAME,
        'payment.succeeded'
    )

    console.log('Notification service connected to RabbitMQ')
}

export function getRabbitMQChannel() {
    if(!channel){
        throw new Error('RabbitMQ has not been initialized')
    }

    return channel
}

export {
    QUEUE_NAME
}