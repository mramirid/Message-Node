import express from 'express'
import { body } from 'express-validator'

import isAuth from '../middlewares/is-auth'
import * as statusController from '../controllers/status'

/* ------------ Sub routes /user/route_name ------------ */

const router = express.Router()

router.get('/status', isAuth, statusController.getStatus)

router.put('/status',
  isAuth,
  [
    body('status')
      .trim()
      .notEmpty()
  ],
  statusController.updateStatus
)

export default router