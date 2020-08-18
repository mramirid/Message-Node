import { Request } from 'express'
import { buildSchema } from 'graphql'

import { IPost } from '../models/Post'
import { IUser } from '../models/User'

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

/* ------ Types for resolver functions --- */

interface MutationResolvers {
  createUser(
    args: { userInput: UserInputData },
    req: Request
  ): Promise<IUser>

  createPost(
    args: { postInput: PostInputData },
    req: Request
  ): Promise<IPost>

  updatePost(
    args: { id: string; postInput: PostInputData },
    req: Request
  ): Promise<IPost>

  deletePost(
    args: { id: string },
    req: Request
  ): Promise<boolean>

  updateStatus(
    args: { status: string },
    req: Request
  ): Promise<IUser>
}

interface QueryResolvers {
  login(
    args: { email: string; password: string },
    req: Request
  ): Promise<JwtAuthData>

  posts(
    args: { page?: number },
    req: Request
  ): Promise<PostsData>

  post(
    args: { id: string },
    req: Request
  ): Promise<IPost>

  user(
    _: unknown,
    req: Request
  ): Promise<IUser>
}

export interface MyResolver extends MutationResolvers, QueryResolvers { }

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
    deletePost(id: ID!): Boolean
    updateStatus(status: String!): User!
  }

  type QueryResolvers {
    login(email: String!, password: String!): JwtAuthData!
    posts(page: Int): PostsData!
    post(id: ID!): Post!
    user: User!
  }

  schema {
    query: QueryResolvers
    mutation: MutationResolvers
  }
`)