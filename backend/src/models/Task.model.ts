import mongoose, { Document, Schema, Types } from 'mongoose';

// Task interface for TypeScript
export interface ITask {
  user: Types.ObjectId | string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  folderId?: string;
  teamId?: string;
  deletedAt: Date | null;
}

// Task Document interface (includes Mongoose document methods)
export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['todo', 'doing', 'review', 'done'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
