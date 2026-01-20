import mongoose, { Document } from 'mongoose';
export interface IUser {
    name: string;
    email: string;
    password: string;
}
export interface IUserDocument extends IUser, Document {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.model.d.ts.map