import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

import Post from '../models/Post'

export const getPosts: RequestHandler = async (_, res, next) => {
  try {
    const posts = await Post.find()
    res.status(200).json({ message: 'Post fetched', posts })
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}

export const getPost: RequestHandler = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      const error = new Error('Cound not find post')
      error.statusCode = 404
      throw error
    }

    res.status(200).json({ message: 'Post fetched', post })

  } catch (error) {
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}

export const createPost: RequestHandler = async (req, res, next) => {
  const inputErrors = validationResult(req)

  if (!inputErrors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    return next(error)
  }

  if (!req.file) {
    const error = new Error('No image provided')
    error.statusCode = 422
    return next(error)
  }

  try {
    const post = new Post({
      title: req.body.title,
      imageUrl: req.file.path,
      content: req.body.content,
      creator: { name: 'Amir' },
    })
    const saveResult = await post.save()

    res.status(201).json({
      message: 'Post created succefully',
      post: saveResult
    })

  } catch (error) {
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}