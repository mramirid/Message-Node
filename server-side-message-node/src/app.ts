import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import { ValidationError } from 'express-validator/src/base'
import { graphqlHTTP } from 'express-graphql'

import activeDir from './utils/active-dir'
import * as errorController from './controllers/error'
import graphqlSchema from './graphql/schema'
import graphqlResolver from './graphql/resolvers'

/* ------------ Customize built-in interfaces ------------ */

declare global {
  export interface Error {
    statusCode?: number
    inputErrors?: ValidationError[]
  }

  namespace Express {
    export interface Request {
      userId: Types.ObjectId
    }
  }
}

/* ---- Setup express extensions & helper middlewares ---- */

const app = express()

app.use('/dist/images', express.static(path.join(activeDir, 'images')))

app.use(bodyParser.json())
app.use(multer({
  storage: multer.diskStorage({
    destination: (_, __, callback) => {
      callback(null, 'dist/images')
    },
    filename: (_, file, callback) => {
      callback(null, `${uuidv4()}-${file.originalname}`)
    }
  }),
  fileFilter: (_, file, callback) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  }
}).single('image'))

/* -------------- Setup our middlewares ------------------ */

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver
}))

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
