import express from 'express'

const app = express()

import router from './routes/order.js'

app.use(express.json())

app.use('/order', router)

app.get('/', (req, res) => {
    res.send('This is order-service testpage')
})

export default app