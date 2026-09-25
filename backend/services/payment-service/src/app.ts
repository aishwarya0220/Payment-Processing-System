import express from 'express'

const app = express()

import router from './router/payment.js'

app.use(express.json())

app.use('/payment', router)

app.get('/', (req, res) => {
    res.send('This is payment-service testpage')
})

export default app