import express from 'express'
import bodyParser from 'body-parser'

import feedRoutes from './routes/feed'

const app = express()

app.use(bodyParser.json())

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)

app.listen(8080)