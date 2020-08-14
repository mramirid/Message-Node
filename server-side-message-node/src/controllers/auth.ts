import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

import User from '../models/User'

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
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}