import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import { MyResolver } from './schema'
import {
  validateSignup,
  validateLogin,
  validateCreatePost,
  validateUpdatePost
} from './validations'
import User from '../models/User'
import Post from '../models/Post'
import removeImage from '../utils/remove-image'

dotenv.config()

const myResolver: MyResolver = {
  async createUser({ userInput }) {
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

  async login({ email, password }) {
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
  },

  async createPost({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.statusCode = 401
      throw error
    }

    const inputErrors = validateCreatePost(postInput)
    if (inputErrors.length > 0) {
      const error = new Error('Invalid input')
      error.inputErrors = inputErrors
      error.statusCode = 422
      throw error
    }

    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    })
    const createdPost = await post.save()
    user.posts.push(createdPost)
    await user.save()

    return {
      ...createdPost.toObject(),
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    }
  },

  async posts({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.statusCode = 401
      throw error
    }

    if (!page) page = 1
    const perPage = 2

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate('creator')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 }),
      Post.find().countDocuments()
    ])

    return {
      posts: posts.map(post => {
        return {
          ...post.toObject(),
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        }
      }),
      totalPosts
    }
  },

  async post({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.statusCode = 401
      throw error
    }

    const post = await Post.findById(id).populate('creator')
    if (!post) {
      const error = new Error('Post not found')
      error.statusCode = 404
      throw error
    }

    return {
      ...post.toObject(),
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }
  },

  async updatePost({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.statusCode = 401
      throw error
    }

    const post = await Post.findById(id).populate('creator')
    if (!post) {
      const error = new Error('Post not found')
      error.statusCode = 404
      throw error
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    const inputErrors = validateUpdatePost(postInput)
    if (inputErrors.length > 0) {
      const error = new Error('Invalid input')
      error.inputErrors = inputErrors
      error.statusCode = 422
      throw error
    }

    post.title = postInput.title
    post.content = postInput.content
    if (post.imageUrl !== postInput.imageUrl) {
      post.imageUrl = postInput.imageUrl
    }
    const updatedPost = await post.save()

    return {
      ...updatedPost.toObject(),
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    }
  },

  async deletePost({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.statusCode = 401
      throw error
    }

    const post = await Post.findById(id)
    if (!post) {
      const error = new Error('Post not found')
      error.statusCode = 404
      throw error
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    const deleteImageUrl = post.imageUrl
    const [user] = await Promise.all([
      User.findById(req.userId),
      Post.findByIdAndRemove(id),
      removeImage(deleteImageUrl)
    ])
    user!.posts.pull(id)
    await user!.save()

    return true
  }
}

export default myResolver