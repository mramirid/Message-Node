import { buildSchema } from 'graphql'

/* ------ Base input/output types --- */

export interface UserInputData {
  email: string
  password: string
  name: string
}

export interface AuthData {
  token: string
  userId: string
}

/* ------ Argument types for resolver functions --- */

export interface CreateUserResolverArgs {
  userInput: UserInputData
}

export interface LoginResolverArgs {
  email: string
  password: string
}

/* ------ Create our graphql schema --- */

export default buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  input UserInputData {
    email: String!
    password: String!
    name: String!
  }

  type MutationResolvers {
    createUser(userInput: UserInputData): User!
  }

  type QueryResolvers {
    login(email: String!, password: String!): AuthData
  }

  schema {
    query: QueryResolvers
    mutation: MutationResolvers
  }
`)