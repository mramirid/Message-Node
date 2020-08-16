import { RequestInfo } from 'express-graphql'
import bcrypt from 'bcryptjs'

import { CreateUserResolverArgs } from './schema'
import { validateSignup } from './validations'
import User from '../models/User'

export default {
  createUser: async ({ userInput }: CreateUserResolverArgs, req: RequestInfo) => {
    const inputErrors = validateSignup(userInput)
    if (inputErrors.length > 0) {
      const error = new Error('Invalid input')
      error.inputErrors = inputErrors
      error.statusCode = 422
      throw error
    }

    const existingUser = await User.findOne({ email: userInput.email })
    if (existingUser) throw new Error('User exists already')

    const hashedPassword = await bcrypt.hash(userInput.password, 12)
    const user = new User({
      email: userInput.email,
      password: hashedPassword,
      name: userInput.name
    })
    const createdUser = await user.save()

    return {
      ...createdUser.toObject(),
      _id: createdUser._id.toString()
    }
  }
}