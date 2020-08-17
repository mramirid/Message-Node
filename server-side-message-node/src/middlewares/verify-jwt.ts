import { RequestHandler } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

dotenv.config()

interface JWTPayload {
  email: string
  userId: string
  iat: number
  exp: number
}

const verifyJWT: RequestHandler = (req, _, next) => {
  try {
    const token = req.get('Authorization')?.split(' ')[1]
    if (!token) throw new Error('No token provided')

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    if (!decodedToken) throw new Error('Invalid token')

    req.userId = Types.ObjectId(decodedToken.userId)
    req.isAuth = true
    next()

  } catch (_) {
    req.isAuth = false
    return next()
  }
}

export default verifyJWT