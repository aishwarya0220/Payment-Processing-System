import express from 'express'

import { getCachedIdempotency, setIdempotencyCache } from '../utils/redis.js'

import { PrismaClient } from '../generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

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
            return res.status(400).json('Idempotency-key header is missing')
        }

        const cachedResponse = await getCachedIdempotency(idempotencyKey)

        if(cachedResponse){
            return res.status(200).json(JSON.parse(cachedResponse))
        }

        try{
            const newPayment = await prisma.payments.create({
                data: {
                    order_id,
                    amount,
                    idempotency_key: idempotencyKey,
                    status: 'SUCCEEDED'
                }
            })

            const responsePayload = {
                status: 'SUCCEEDED',
                order_id: newPayment.order_id,
                amount: newPayment.amount,
                payment_id: newPayment.id
            }

            await setIdempotencyCache(idempotencyKey, responsePayload)

            return res.status(201).json(responsePayload)

        }catch(err: any){

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