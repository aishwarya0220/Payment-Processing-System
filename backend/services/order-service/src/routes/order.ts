import express from 'express'

import { PrismaClient } from '../generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL})

const prisma = new PrismaClient({adapter})

const router = express.Router()

router.post('/', async( req, res) => {
    try{

        const {user_id, amount} = req.body

        const idempotencyKey = req.headers['idempotency-key']
    
        if(!user_id || amount == undefined){
            return res.status(400).json('Missing required fields:"user_id" or "amount" ')
        }

        if(!idempotencyKey){
            return res.status(400).json('Missing "idempotency-key" header')
        }
    
        const newOrder = await prisma.orders.create({
            data: {
                user_id,
                amount,
                status: 'PENDING_PAYMENT'
            }
        })

        const paymentResponse = await fetch('http://payment-service:3002/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': idempotencyKey as string
            },
            body: JSON.stringify({
                order_id: newOrder.id,
                amount: newOrder.amount
            })
        })

        if(!paymentResponse.ok){
            const errorData = await paymentResponse.json()
            
            await prisma.orders.update({
                where: {id: newOrder.id},
                data: {status: 'FAILED'}
            })

            return res.status(400).json({error: errorData.error || 'Payment failed, order marked as FAILED'})
        }

        const paymentData = await paymentResponse.json()

        const updateOrder = await prisma.orders.update({
            where: { id: newOrder.id},
            data: { status: 'PAID'}
        })
    
        return res.status(201).json({
            message: "Order created successfully, payment-pending",
            order: updateOrder,
            payment: paymentData
        })

    }catch(err){
        console.error("Error processing order/payment flow", err)

        if(newOrder?.id){
            await prisma.orders.update({
                where: { id: newOrder.id},
                data: { status: 'FAILED'}
            }).catch(dbErr => console.error('Failed to update order status to "FAILED"', dbErr))
        }

        return res.status(500).json({ error: "Internal server error during order creation" });
    }
})

export default router