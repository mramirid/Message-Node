import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

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

export const createPost: RequestHandler = (req, res) => {
  const inputErrors = validationResult(req)

  if (!inputErrors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect',
      errors: inputErrors.array()
    })
  }

  const title = req.body.title
  const content = req.body.content

  res.status(201).json({
    message: 'Post created succefully',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Amir' },
      createdAt: new Date()
    }
  })
}