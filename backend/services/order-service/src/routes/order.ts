import express from 'express'

import { PrismaClient } from '../generated/prisma/client.js'

const prisma = PrismaClient

const router = express.Router()

router.post('/', async( req, res) => {
    const {user_id, amount, status} = req.body

    if(!user_id || amount == undefined){
        return res.status(400).json('Missing required fiels:"user_id" or "amount" ')
    }

    const newOrder = await prisma.

    
})

// import { Request, Response } from 'express';
// // Assuming you have your Prisma client set up
// // import prisma from '../config/prisma.js'; 

// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     // 1. Destructure the required fields from req.body
//     const { user_id, amount, status } = req.body;

//     // 2. Basic validation
//     if (!user_id || amount === undefined) {
//       return res.status(400).json({ error: "Missing required fields: user_id and amount" });
//     }

//     // 3. Save to your order_db using Prisma
//     // const newOrder = await prisma.order.create({
//     //   data: {
//     //     user_id,
//     //     amount,
//     //     status: status || "PENDING", // fallback status if not provided
//     //   },
//     // });

//     // Temporary mock response until Prisma client is wired up
//     return res.status(201).json({
//       message: "Order created successfully",
//       order: { user_id, amount, status }
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
