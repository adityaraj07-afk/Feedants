import mongoose, { Schema, Document } from 'mongoose';

export interface IPrizeBreakdown {
  position: number;
  label: string;
  rewardAmount: number;
  perks: string[];
}

export interface IJudgingParameter {
  parameter: string;
  weightage: number;
  description: string;
}

export interface ICompetition extends Document {
  title: string;
  slug: string;
  bannerUrl: string;
  categoryTags: string[];
  hasCertificate: boolean;
  prizePool: {
    total: number;
    currency: string;
    breakdown: IPrizeBreakdown[];
  };
  entryFee: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  capacity: {
    maxSpots: number;
    filledSpots: number;
  };
  judge: {
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    introVideoUrl: string;
  };
  timeline: {
    registrationStartDate: Date;
    registrationEndDate: Date;
    submissionStartDate: Date;
    submissionEndDate: Date;
    resultDate: Date;
  };
  tabsContent: {
    about: string;
    judgingParameters: IJudgingParameter[];
    rulesAndEligibility: string[];
  };
  statusOverride: 'active' | 'cancelled' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const PrizeBreakdownSchema = new Schema<IPrizeBreakdown>(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true },
    rewardAmount: { type: Number, required: true },
    perks: [{ type: String }],
  },
  { _id: false }
);

const JudgingParameterSchema = new Schema<IJudgingParameter>(
  {
    parameter: { type: String, required: true },
    weightage: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const CompetitionSchema = new Schema<ICompetition>(
  {
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80',
    },
    categoryTags: {
      type: [String],
      default: ['Dance', 'Multi-Win'],
    },
    hasCertificate: {
      type: Boolean,
      default: true,
    },
    prizePool: {
      total: { type: Number, required: true, default: 50000 },
      currency: { type: String, default: 'INR' },
      breakdown: [PrizeBreakdownSchema],
    },
    entryFee: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isFree: { type: Boolean, default: true },
    },
    capacity: {
      maxSpots: { type: Number, required: true, min: 1 },
      filledSpots: { type: Number, default: 0, min: 0 },
    },
    judge: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      avatarUrl: { type: String, required: true },
      bio: { type: String, required: true },
      introVideoUrl: { type: String, default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    },
    timeline: {
      registrationStartDate: { type: Date, required: true },
      registrationEndDate: { type: Date, required: true },
      submissionStartDate: { type: Date, required: true },
      submissionEndDate: { type: Date, required: true },
      resultDate: { type: Date, required: true },
    },
    tabsContent: {
      about: { type: String, required: true },
      judgingParameters: [JudgingParameterSchema],
      rulesAndEligibility: [{ type: String }],
    },
    statusOverride: {
      type: String,
      enum: ['active', 'cancelled', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// High concurrency indexes
CompetitionSchema.index({ 'timeline.registrationEndDate': 1 });
CompetitionSchema.index({ 'timeline.submissionEndDate': 1 });
CompetitionSchema.index({ 'timeline.resultDate': 1 });

export const Competition = mongoose.model<ICompetition>('Competition', CompetitionSchema);
