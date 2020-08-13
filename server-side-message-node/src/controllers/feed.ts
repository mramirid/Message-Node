import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

import Post from '../models/Post'

export const getPosts: RequestHandler = (_, res) => {
  res.status(200).json({
    posts: [{
      _id: '1',
      title: 'First Post',
      content: 'This is the first post',
      imageUrl: 'images/mekbuk.jpg',
      creator: { name: 'Amir' },
      createdAt: new Date()
    }]
  })
}

export const createPost: RequestHandler = async (req, res, next) => {
  const inputErrors = validationResult(req)

  if (!inputErrors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    return next(error)
  }

  try {
    const post = new Post({
      title: req.body.title,
      imageUrl: 'images/mekbuk.jpg',
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