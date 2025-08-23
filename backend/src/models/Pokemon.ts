import mongoose, { Schema, Document } from 'mongoose';
import { Pokemon as PokemonType } from '../../../shared/types';

interface PokemonDocument extends PokemonType, Document {}

const PokemonSchema = new Schema<PokemonDocument>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  koreanName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  region: { type: String, required: true },
  multiplicationTable: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 9 
  },
  rarity: { 
    type: String, 
    required: true, 
    enum: ['common', 'uncommon', 'rare', 'legendary'] 
  },
  characteristics: [{ type: String }]
}, {
  timestamps: true
});

// 인덱스 생성
PokemonSchema.index({ multiplicationTable: 1 });
PokemonSchema.index({ region: 1 });
PokemonSchema.index({ rarity: 1 });

export const PokemonModel = mongoose.model<PokemonDocument>('Pokemon', PokemonSchema);