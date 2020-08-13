import { RequestHandler } from "express";

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
  const title = req.body.title
  const content = req.body.content

  res.status(201).json({
    message: 'Post created succefully',
    post: { id: new Date().toISOString(), title, content }
  })
}