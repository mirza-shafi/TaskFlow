import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder {
  name: string;
  user: Types.ObjectId | string;
  color: string;
  isPrivate: boolean;
}

export interface IFolderDocument extends IFolder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolderDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    color: {
      type: String,
      default: '#5c6bc0'
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Folder = mongoose.model<IFolderDocument>('Folder', folderSchema);

export default Folder;
