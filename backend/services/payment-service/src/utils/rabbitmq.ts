import amqp, { type Channel, type ChannelModel } from 'amqplib'

const RABBITMQ_HOST = `amqp://admin:admin123@${process.env.RABBITMQ_HOST || 'localhost'}:5672`

const EXCHANGE_NAME = 'payment.events'

let connection: ChannelModel

let channel: Channel

export async function connectRabbitMQ() {
    connection = await amqp.connect(RABBITMQ_HOST)

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