import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import activeDir from './utils/path'
import feedRoutes from './routes/feed'
import * as errorController from './controllers/error'

/* ------------ Customize built-in interfaces ------------ */
declare global {
  export interface Error {
    statusCode: number
  }
}

/* ---- Setup express extensions & helper middlewares ---- */
const app = express()

app.use(bodyParser.json())

app.use('/images', express.static(path.join(activeDir, 'images')))

/* -------------- Setup our middlewares ------------------ */
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)
app.use(errorController.serverErrorHandler)

/* ------- Setup MongoDB connection & start sever -------- */
dotenv.config()
const cluster = process.env.CLUSTER_NAME
const dbname = process.env.DB_NAME
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const MONGODB_URL = `mongodb+srv://${username}:${password}@${cluster}.dxksd.mongodb.net/${dbname}?retryWrites=true&w=majority`

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(_ => {
  app.listen(8080)
}).catch(error => {
  console.log(error)
})
