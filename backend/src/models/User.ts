import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '../../../shared/types';

interface UserDocument extends Omit<UserType, 'id'>, Document {
  id: string;
}

const UserSchema = new Schema<UserDocument>({
  id: { type: String, required: true, unique: true },
  nickname: { type: String, required: true, trim: true },
  trainerLevel: { type: Number, required: true, default: 1, min: 1 },
  currentRegion: { type: String, required: true, default: '관동지방' },
  completedTables: [{ 
    type: Number, 
    min: 0, 
    max: 9 
  }],
  caughtPokemon: [{ type: Number }],
  totalExperience: { type: Number, required: true, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 생성
UserSchema.index({ trainerLevel: -1 });
UserSchema.index({ currentRegion: 1 });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);