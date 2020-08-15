import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

import User from '../models/User'

export const getStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('Could not find user')
      error.statusCode = 404
      throw error
    }

    res.status(200).json({
      message: 'Status fetched',
      status: user.status
    })

  } catch (error) {
    next(error)
  }
}

export const updateStatus: RequestHandler = async (req, res, next) => {
  const inputErrors = validationResult(req)
  if (!inputErrors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    return next(error)
  }

  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('Could not find user')
      error.statusCode = 404
      throw error
    }

    user.status = req.body.status
    await user.save()
    
    res.status(200).json({
      message: 'Status updated',
      status: user.status
    })
    
  } catch (error) {
    next(error)
  }
}