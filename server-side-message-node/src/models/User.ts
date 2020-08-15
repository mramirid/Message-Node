import mongoose, { Schema, Document, Types } from 'mongoose'

import { IPost } from './Post'

interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  password: string
  name: string
  status: string
  posts: (IPost | Types.ObjectId)[]
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'I am new!'
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ]
})

export default mongoose.model<IUser>('User', userSchema)