import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationId: Types.ObjectId;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  submittedAt: Date;
  status: 'submitted' | 'under_review' | 'evaluated';
  score?: number;
  feedback?: string;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Submission title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    mediaUrl: {
      type: String,
      required: [true, 'Media/Video URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'evaluated'],
      default: 'submitted',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// One active submission per user per competition
SubmissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
SubmissionSchema.index({ competitionId: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
