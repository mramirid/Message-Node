import mongoose, { Schema, Document } from 'mongoose'

interface IPost extends Document {
  _id: string
  title: string
  imageUrl: string
  content: string
  creator: {
    name: string
  }
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
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IPost>('Post', postSchema)