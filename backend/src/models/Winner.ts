import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWinner extends Document {
  competitionId: Types.ObjectId;
  edition: string;
  position: number;
  userName: string;
  userAvatarUrl: string;
  userHandle: string;
  winningProjectTitle: string;
  projectMediaUrl: string;
  prizeWon: string;
  announcedAt: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    edition: {
      type: String,
      required: true,
      default: 'Previous Edition',
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatarUrl: {
      type: String,
      required: true,
    },
    userHandle: {
      type: String,
      required: true,
      trim: true,
    },
    winningProjectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    projectMediaUrl: {
      type: String,
      default: 'https://youtube.com',
    },
    prizeWon: {
      type: String,
      required: true,
    },
    announcedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

WinnerSchema.index({ competitionId: 1, position: 1 });

export const Winner = mongoose.model<IWinner>('Winner', WinnerSchema);
