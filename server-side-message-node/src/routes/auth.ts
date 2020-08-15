import express from 'express'
import { body } from 'express-validator'

import User from '../models/User'
import * as authController from '../controllers/auth'

/* ------------ Sub routes /auth/route_name ------------ */

const router = express.Router()

router.put('/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async email => {
        const user = await User.findOne({ email })
        if (user) {
          return Promise.reject('Email address already exists')
        }
      }),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .notEmpty()
  ],
  authController.signup
)

router.post('/login', authController.login)

export default router