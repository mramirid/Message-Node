import validator from 'validator'

import { UserInputData } from "./schema"

export interface InputError {
  message: string
}

export function validateSignup(userInput: UserInputData) {
  const inputErrors: InputError[] = []

  if (!validator.isEmail(userInput.email)) {
    inputErrors.push({ message: 'Email is invalid' })
  }

  if (
    !validator.isEmpty(userInput.password) ||
    !validator.isLength(userInput.password, { min: 5 })
  ) {
    inputErrors.push({ message: 'Password too short' })
  }

  return inputErrors
}