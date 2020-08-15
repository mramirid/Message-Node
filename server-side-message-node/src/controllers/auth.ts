import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import User from '../models/User'

dotenv.config()

export const signup: RequestHandler = async (req, res, next) => {
  const inputErrors = validationResult(req)
  if (!inputErrors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.inputErrors = inputErrors.array()
    return next(error)
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name
    })
    const createdUser = await user.save()

    res.status(201).json({
      message: 'User created',
      userId: createdUser._id
    })

  } catch (error) {
    next(error)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      const error = new Error('User with this email could not be found')
      error.statusCode = 401
      throw error
    }

    const isPassMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isPassMatch) {
      const error = new Error('Wrong password')
      error.statusCode = 401
      throw error
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_TOKEN!,
      { expiresIn: '1h' }
    )

    res.status(200).json({
      token, userId: user._id.toString()
    })

  } catch (error) {
    next(error)
  }
}