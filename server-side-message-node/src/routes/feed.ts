import express from 'express'
import { body } from 'express-validator'

import * as feedController from '../controllers/feed'

const router = express.Router()

/* ------------ Sub routes /feed/route_name ------------ */

router.get('/posts', feedController.getPosts)

router.get('/post/:postId', feedController.getPost)

router.post('/post',
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

export default router