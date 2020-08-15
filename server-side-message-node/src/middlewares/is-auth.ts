import { RequestHandler } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mongoose, { Types } from 'mongoose'

dotenv.config()

interface JWTPayload {
  email: string
  userId: string
  iat: number
  exp: number
}

const isAuth: RequestHandler = (req, _, next) => {
  const token = req.get('Authorization')?.split(' ')[1]
  if (!token) {
    const error = new Error('No token provided')
    error.statusCode = 401
    throw error
  }

  const decodedToken = jwt.verify(token, process.env.JWT_TOKEN!) as JWTPayload
  if (!decodedToken) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }

  req.userId = Types.ObjectId(decodedToken.userId)
  next()
}

export default isAuth