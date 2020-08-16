import { RequestInfo } from 'express-graphql'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import { CreateUserResolverArgs, LoginResolverArgs, AuthData } from './schema'
import { validateSignup, validateLogin } from './validations'
import User, { IUser } from '../models/User'

dotenv.config()

export default {
  async createUser({ userInput }: CreateUserResolverArgs, req: RequestInfo): Promise<IUser> {
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
  },

  async login({ email, password }: LoginResolverArgs): Promise<AuthData> {
    const inputErrors = validateLogin(email, password)
    if (inputErrors.length > 0) {
      const error = new Error('Invalid input')
      error.inputErrors = inputErrors
      error.statusCode = 422
      throw error
    }
    
    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 401
      throw error
    }

    const isPassMatch = await bcrypt.compare(password, user.password)
    if (!isPassMatch) {
      const error = new Error('Password is incorrect')
      error.statusCode = 401
      throw error
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    return {
      token,
      userId: user._id.toString()
    }
  }
}