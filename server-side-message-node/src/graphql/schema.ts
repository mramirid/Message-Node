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

export type CreateUserResolverArgs = { userInput: UserInputData }

export type LoginResolverArgs = { email: string; password: string }

export type CreatePostResolverArgs = { postInput: PostInputData }

export type PostsResolverArgs = { page?: number }

export type PostResolverArgs = { id: string }

export type UpdatePostResolverArgs = { id: string; postInput: PostInputData }

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
    updatePost(id: ID!, postInput: PostInputData): Post!
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