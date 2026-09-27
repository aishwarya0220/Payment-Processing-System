import amqp, { type Channel, type ChannelModel } from 'amqplib'

const RABBITMQ_URL =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'

const EXCHANGE_NAME = 'payment.events'

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

    console.log('RabbitMQ connected')
}

export function getRabbitMQChannel() {
    if(!channel){
        throw new Error('RabbitMQ channel is not initialized')
    }

    return channel
}

export {
    EXCHANGE_NAME
}