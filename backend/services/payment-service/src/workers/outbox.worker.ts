
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client.js'

import { getRabbitMQChannel, EXCHANGE_NAME } from '../utils/rabbitmq.js'

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})

const prisma = new PrismaClient({adapter})

export async function processOutbox() {
    const events = await prisma.outboxEvent.findMany({
        where: {
            status: 'PENDING'
        },
        orderBy: {
            created_at: 'asc'
        },
        take: 10
    })

    const channel = getRabbitMQChannel()

    for(const event of events){
        try{
            const published = channel.publish(
                EXCHANGE_NAME,
                event.event_type,
                Buffer.from(JSON.stringify(event.payload)),
                {
                    persistent: true,
                    contentType: 'application/json'
                }
            )

            if(!published){
                console.log(`RabbitMQ event full for event ${event.id}`)

                continue
            }

            await prisma.outboxEvent.update({
                where: {
                    id: event.id
                },
                data: {
                    status: 'PUBLISHED',
                    published_at: new Date(),
                    attempt: {
                        increment: 1
                    }
                }
            })
        }catch(err){
            console.error(`Failed to publish event ${event.id}`, err)

            await prisma.outboxEvent.update({
                where: {
                    id: event.id,
                },
                data: {
                    attempt: {
                        increment: 1
                    }
                }
            })
        }
    }
}