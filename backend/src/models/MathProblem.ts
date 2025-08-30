import mongoose, { Schema, Document } from 'mongoose';
import { MathProblem as MathProblemType } from '../types';

interface MathProblemDocument extends Omit<MathProblemType, 'id'>, Document {
  id: string;
}

const MathProblemSchema = new Schema<MathProblemDocument>({
  id: { type: String, required: true, unique: true },
  story: { type: String, required: true },
  hint: { type: String, required: true },
  equation: { type: String, required: true },
  answer: { type: Number, required: true },
  multiplicationTable: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 9 
  },
  pokemonId: { type: Number, required: true },
  difficulty: { 
    type: Number, 
    required: true, 
    enum: [1, 2, 3] 
  },
  visualElements: {
    pokemonCount: { type: Number },
    itemsPerPokemon: { type: Number },
    totalItems: { type: Number }
  }
}, {
  timestamps: true
});

// 인덱스 생성
MathProblemSchema.index({ multiplicationTable: 1 });
MathProblemSchema.index({ difficulty: 1 });
MathProblemSchema.index({ pokemonId: 1 });

export const MathProblemModel = mongoose.model<MathProblemDocument>('MathProblem', MathProblemSchema);