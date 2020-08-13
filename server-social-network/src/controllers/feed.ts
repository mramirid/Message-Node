import { RequestHandler } from "express";

export const getPosts: RequestHandler = (_, res) => {
  res.status(200).json({
    posts: [{ title: 'First Post', content: 'This is the first post' }]
  })
}

export const createPost: RequestHandler = (req, res) => {
  const title = req.body.title
  const content = req.body.content

  res.status(201).json({
    message: 'Post created succefully',
    post: { id: new Date().toISOString(), title, content }
  })
}