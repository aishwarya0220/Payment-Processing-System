import express from 'express'

import { PrismaClient } from '../generated/prisma/client.js'

import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL})

const prisma = new PrismaClient({adapter})

const router = express.Router()

console.log('DATABASE_URL:', process.env.DATABASE_URL)

router.post('/', async( req, res) => {
    let orderId: string | undefined
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

        orderId = newOrder.id

        const paymentResponse = await fetch('http://localhost:3002/payment', {
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
            
            await prisma.orders.update({
                where: {id: newOrder.id},
                data: {status: 'FAILED'}
            })

            return res.status(400).json({error: 'Payment failed'})
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

        if(orderId){
            await prisma.orders.update({
                where: { id: orderId},
                data: { status: 'PENDING_PAYMENT'}
            }).catch(dbErr => console.error('Failed to update order status', dbErr))
        }

        return res.status(500).json({ error: "Internal server error during order creation" });
    }
})

export default router