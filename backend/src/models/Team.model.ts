import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeam {
  name: string;
  owner: Types.ObjectId | string;
  members: (Types.ObjectId | string)[];
}

export interface ITeamDocument extends ITeam, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Team = mongoose.model<ITeamDocument>('Team', teamSchema);

export default Team;
