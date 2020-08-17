import { ErrorRequestHandler } from 'express'

const serverErrorHandler: ErrorRequestHandler = (err, _, res, __) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  const inputErrors = err.inputErrors || []

  console.log(statusCode, message)

  res.status(statusCode).json({
    message: message,
    data: inputErrors
  })
}

export default serverErrorHandler