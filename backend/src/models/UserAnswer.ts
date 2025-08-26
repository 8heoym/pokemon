import mongoose, { Schema, Document } from 'mongoose';
import { UserAnswer as UserAnswerType } from '../../../shared/types';

interface UserAnswerDocument extends Omit<UserAnswerType, 'id'>, Document {
  id: string;
}

const UserAnswerSchema = new Schema<UserAnswerDocument>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  userAnswer: { type: Number, required: true },
  correctAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number, required: true, min: 0 }, // 초 단위
  hintsUsed: { type: Number, required: true, default: 0, min: 0 },
  attemptedAt: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 생성
UserAnswerSchema.index({ userId: 1, attemptedAt: -1 });
UserAnswerSchema.index({ problemId: 1 });
UserAnswerSchema.index({ isCorrect: 1 });

export const UserAnswerModel = mongoose.model<UserAnswerDocument>('UserAnswer', UserAnswerSchema);