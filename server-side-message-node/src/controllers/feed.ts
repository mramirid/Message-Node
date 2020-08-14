import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import slash from 'slash'

import Post from '../models/Post'
import removeImage from '../utils/clear-image'

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const currentPage = req.query.page ? +req.query.page : 1
    const itemsPerPage = 2
    const [posts, totalItems] = await Promise.all([
      Post.find().skip((currentPage - 1) * itemsPerPage).limit(itemsPerPage),
      Post.find().countDocuments()
    ])

    res.status(200).json({
      message: 'Post fetched',
      posts,
      totalItems
    })

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
      imageUrl: slash(req.file.path),
      content: req.body.content,
      creator: { name: 'Amir' },
    })
    const createdPost = await post.save()

    res.status(201).json({
      message: 'Post created succefully',
      post: createdPost
    })

  } catch (error) {
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}

export const updatePost: RequestHandler = async (req, res, next) => {
  const inputErrors = validationResult(req)
  if (!inputErrors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    return next(error)
  }

  const postId = req.params.postId
  const title = req.body.title
  const content = req.body.content
  const imageUrl = req.file ? slash(req.file.path) : req.body.image

  if (!imageUrl) {
    const error = new Error('No image picked')
    error.statusCode = 422
    return next(error)
  }

  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Cound not find post')
      error.statusCode = 404
      throw error
    }

    if (imageUrl !== post.imageUrl) {
      await removeImage(post.imageUrl)
    }

    post.title = title
    post.imageUrl = imageUrl
    post.content = content
    const updatedPost = await post.save()

    res.status(200).json({
      message: 'Post updated',
      post: updatedPost
    })

  } catch (error) {
    if (!error.statusCode) error.statusCode = 500
    next(error)
  }
}