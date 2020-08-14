import { ErrorRequestHandler } from 'express'

export const serverErrorHandler: ErrorRequestHandler = (err, _, res, __) => {
  console.log(err.statusCode, err.message)
  res.status(err.statusCode || 500).json({
    message: err.message,
    data: err.inputErrors
  })
}