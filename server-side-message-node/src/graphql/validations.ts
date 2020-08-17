import validator from 'validator'

import { UserInputData, PostInputData } from "./schema"

export interface InputError {
  message: string
}

export function validateSignup(userInput: UserInputData) {
  const inputErrors: InputError[] = []

  if (!validator.isEmail(userInput.email)) {
    inputErrors.push({ message: 'Email is invalid' })
  }
  if (
    validator.isEmpty(userInput.password) ||
    !validator.isLength(userInput.password, { min: 5 })
  ) {
    inputErrors.push({ message: 'Password too short' })
  }

  return inputErrors
}

export function validateLogin(email: string, password: string) {
  const inputErrors: InputError[] = []

  if (!validator.isEmail(email)) {
    inputErrors.push({ message: 'Email is invalid' })
  }
  if (
    validator.isEmpty(password) ||
    !validator.isLength(password, { min: 5 })
  ) {
    inputErrors.push({ message: 'Password too short' })
  }

  return inputErrors
}

export function validateCreatePost(postInput: PostInputData) {
  const inputErrors: InputError[] = []

  if (
    validator.isEmpty(postInput.title) ||
    !validator.isLength(postInput.title, { min: 5 })
  ) {
    inputErrors.push({ message: 'Title is invalid' })
  }
  if (
    validator.isEmpty(postInput.content) ||
    !validator.isLength(postInput.content, { min: 5 })
  ) {
    inputErrors.push({ message: 'Content is invalid' })
  }

  return inputErrors
}