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

export const createPost: RequestHandler = async (req, res) => {
  const inputErrors = validationResult(req)

  if (!inputErrors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect',
      errors: inputErrors.array()
    })
  }

  try {
    const title = req.body.title
    const content = req.body.content

    const post = new Post({
      title,
      content,
      imageUrl: 'images/mekbuk.jpg',
      creator: { name: 'Amir' },
    })
    const saveResult = await post.save()

    res.status(201).json({
      message: 'Post created succefully',
      post: saveResult
    })
  } catch (error) {
    console.log(error)
  }
}