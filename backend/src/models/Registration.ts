import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationCode: string;
  referredByCode?: string;
  registeredAt: Date;
  status: 'confirmed' | 'cancelled';
}

const RegistrationSchema = new Schema<IRegistration>(
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
    registrationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referredByCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// COMPOUND UNIQUE INDEX: Enforces single registration per user per competition at the DB level!
RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
RegistrationSchema.index({ competitionId: 1, status: 1 });

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
