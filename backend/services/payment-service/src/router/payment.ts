import express from 'express'

import { getCachedIdempotency, setIdempotencyCache } from '../utils/redis.js'

import { PrismaClient } from '../generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

import { mockGateway } from '../utils/mockGateway.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({adapter})

const router = express.Router()

router.post('/', async( req, res) => {
    try{
        const { order_id, amount } = req.body

        if(!order_id || amount == undefined){
            return res.status(400).json('order-id or amount fields are missing')
        }

        const idempotencyKey = req.headers['idempotency-key'] as string

        if(!idempotencyKey){
            return res.status(400).json('Idempotency-key header is missing');
        };

        const cachedResponse = await getCachedIdempotency(idempotencyKey)

        if(cachedResponse){
            return res.status(200).json(JSON.parse(cachedResponse))
        }

        try{
            const gatewayResult = await mockGateway.charge({ amount, order_id })

            const newPayment = await prisma.$transaction(async (tx) => {
                const payment = await tx.payments.create({
                    data: {
                        order_id,
                        amount,
                        idempotency_key: idempotencyKey,
                        status: gatewayResult.status,
                        gateway_response: gatewayResult.gateway_response
                    }
                })

                if(gatewayResult.status === 'SUCCEEDED'){
                    await tx.outboxEvent.create({
                        data: {
                            event_type: 'payment.succeeded',
                            aggregate_id: payment.id,
                            payload: {
                                payment_id: payment.id,
                                order_id: payment.order_id,
                                amount: payment.amount,
                                status: payment.status
                            }
                        }
                    })
                }
                return payment
            })

            const responsePayload = {
                status: 'SUCCEEDED',
                order_id: newPayment.order_id,
                amount: newPayment.amount,
                payment_id: newPayment.id,
                gateway_response: newPayment.gateway_response
            }

            await setIdempotencyCache(idempotencyKey, responsePayload)

            return res.status(201).json(responsePayload)

        }catch(err: any){

            if(err.name == 'CardDeclinedError'){
                return res.status(422).json({ error: err.message})
            }

            if(err.name == 'GatewayTimeoutError'){
                return res.status(504).json({ error: err.message})
            }

            if(err.code == 'P2002'){
                const existingPayment = await prisma.payments.findUnique({
                    where: { idempotency_key: idempotencyKey}
                })

                if(existingPayment){
                    const fallbackPayload = {
                        status: existingPayment.status,
                        payment_id: existingPayment.id,
                        order_id: existingPayment.order_id,
                        amount: existingPayment.amount
                    }
                    await setIdempotencyCache(idempotencyKey, fallbackPayload)
                    return res.status(200).json(fallbackPayload)
                }
            }
            throw err
        }
    }catch(err){
        console.error("Error processing payment:", err);
        return res.status(500).json({ error: "Payment service internal error" })
    }
})

export default router