import express from 'express'
import { body } from 'express-validator'

import isAuth from '../middlewares/is-auth'
import * as feedController from '../controllers/feed'

const router = express.Router()

/* ------------ Sub routes /feed/route_name ------------ */

router.get('/posts', isAuth, feedController.getPosts)

router.get('/post/:postId', isAuth, feedController.getPost)

router.post('/post',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
)

router.put('/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.updatePost
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

export default router