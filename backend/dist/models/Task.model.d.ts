import mongoose, { Document, Types } from 'mongoose';
export interface ITask {
    user: Types.ObjectId | string;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate: Date | null;
}
export interface ITaskDocument extends ITask, Document {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Task: mongoose.Model<ITaskDocument, {}, {}, {}, mongoose.Document<unknown, {}, ITaskDocument, {}, {}> & ITaskDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default Task;
//# sourceMappingURL=Task.model.d.ts.map