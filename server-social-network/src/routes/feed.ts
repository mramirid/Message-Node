import express from 'express'

import * as feedController from '../controllers/feed'

const router = express.Router()

/* ------------ Sub routes /feed/route_name ------------ */

router.get('/posts', feedController.getPosts)

router.post('/post', feedController.createPost)

export default router