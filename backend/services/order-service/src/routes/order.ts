import express from 'express'

import { Prisma } from '../generated/prisma/browser.js'

const router = express.Router()

router.post('/', async( req: Request, res: Response) => {
    const {user_id, amount, status} = req.body

    
})