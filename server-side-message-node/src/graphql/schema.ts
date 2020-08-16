import { buildSchema } from 'graphql'

export interface UserInputData {
  email: string
  password: string
  name: string
}

export interface CreateUserResolverArgs {
  userInput: UserInputData
}

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

  input UserInputData {
    email: String!
    password: String!
    name: String!
  }

  type MutationResolvers {
    createUser(userInput: UserInputData): User!
  }

  type QueryResolvers {
    hello: String
  }

  schema {
    query: QueryResolvers
    mutation: MutationResolvers
  }
`)