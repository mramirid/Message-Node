import { ErrorRequestHandler } from 'express'

const serverErrorHandler: ErrorRequestHandler = (err, _, res, __) => {
  console.log(err.statusCode || 500, err.message)
  res.status(err.statusCode || 500).json({
    message: err.message,
    data: err.inputErrors
  })
}

export default serverErrorHandler