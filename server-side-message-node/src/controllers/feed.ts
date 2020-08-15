import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import slash from 'slash'

import Post from '../models/Post'
import User from '../models/User'
import removeImage from '../utils/remove-image'

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const currentPage = req.query.page ? +req.query.page : 1
    const itemsPerPage = 2
    const [posts, totalItems] = await Promise.all([
      Post.find()
        .populate('creator')
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage),
      Post.find().countDocuments()
    ])

    res.status(200).json({
      message: 'Post fetched',
      posts,
      totalItems
    })

  } catch (error) {
    next(error)
  }
}

export const getPost: RequestHandler = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate('creator')
    if (!post) {
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }

    res.status(200).json({ message: 'Post fetched', post })

  } catch (error) {
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
      creator: req.userId,
    })

    const [createdPost, user] = await Promise.all([
      post.save(),
      User.findById(req.userId)
    ])

    user!.posts.push(createdPost)
    const creator = await user!.save()

    res.status(201).json({
      message: 'Post created succefully',
      post: createdPost,
      creator: {
        _id: creator._id,
        name: creator.name
      }
    })

  } catch (error) {
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
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized')
      error.statusCode = 403
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
    next(error)
  }
}

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const postId = req.params.postId
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Could not find post')
      error.statusCode = 404
      throw error
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    const [deletedPost] = await Promise.all([
      Post.findByIdAndRemove(postId),
      removeImage(post.imageUrl)
    ])

    const user = await User.findById(req.userId)
    user!.posts.pull(postId)
    await user!.save()

    res.status(200).json({
      message: 'Deleted post',
      post: deletedPost
    })

  } catch (error) {
    next(error)
  }
}