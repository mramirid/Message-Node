import { buildSchema } from 'graphql'

import { IPost } from '../models/Post'

/* ------ Base input/output types --- */

export interface UserInputData {
  email: string
  password: string
  name: string
}

export interface PostInputData {
  title: string
  content: string
  imageUrl: string
}

export interface JwtAuthData {
  token: string
  userId: string
}

export interface PostsData {
  posts: IPost[]
  totalPosts: number
}

/* ------ Argument types for resolver functions --- */

export interface CreateUserResolverArgs {
  userInput: UserInputData
}

export interface LoginResolverArgs {
  email: string
  password: string
}

export interface CreatePostResolverArgs {
  postInput: PostInputData
}

export interface PostsResolverArgs {
  page?: number
}

export interface PostResolverArgs {
  id: string
}

/* ------ Create our graphql schema --- */

export default buildSchema(`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  input UserInputData {
    email: String!
    password: String!
    name: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type JwtAuthData {
    token: String!
    userId: String!
  }

  type PostsData {
    posts: [Post!]!
    totalPosts: Int!
  }

  type MutationResolvers {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
  }

  type QueryResolvers {
    login(email: String!, password: String!): JwtAuthData!
    posts(page: Int): PostsData!
    post(id: ID!): Post!
  }

  schema {
    query: QueryResolvers
    mutation: MutationResolvers
  }
`)