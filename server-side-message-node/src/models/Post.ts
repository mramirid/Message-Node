import mongoose, { Schema, Document, Types } from 'mongoose'

import { IUser } from './User'

export interface IPost extends Document {
  _id: Types.ObjectId
  title: string
  imageUrl: string
  content: string
  creator: IUser & Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IPost>('Post', postSchema)