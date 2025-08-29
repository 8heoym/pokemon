import React from 'react';
import { motion } from 'framer-motion';

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
  rarity: string;
}

interface PokemonImageCardProps {
  pokemon: Pokemon;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const PokemonImageCard: React.FC<PokemonImageCardProps> = ({ pokemon, className = '', size = 'large' }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-100 to-gray-200 border-gray-300';
      case 'uncommon':
        return 'from-green-100 to-green-200 border-green-300';
      case 'rare':
        return 'from-blue-100 to-blue-200 border-blue-300';
      case 'legendary':
        return 'from-purple-100 to-purple-200 border-purple-300';
      default:
        return 'from-gray-100 to-gray-200 border-gray-300';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'legendary':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return { container: 'w-32 h-32', text: 'text-xs', padding: 'p-2' };
      case 'medium':
        return { container: 'w-48 h-48', text: 'text-sm', padding: 'p-4' };
      case 'large':
      default:
        return { container: 'w-96 h-96', text: 'text-base', padding: 'p-8' };
    }
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <motion.div 
      className={`relative ${sizeClasses.container} rounded-xl border-4 bg-gradient-to-br ${getRarityColor(pokemon.rarity)} shadow-lg overflow-hidden ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* 레어도 배지 */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getRarityBadgeColor(pokemon.rarity)} z-10`}>
        {pokemon.rarity.toUpperCase()}
      </div>

      {/* 포켓몬 이미지 */}
      <div className={`flex items-center justify-center h-full ${sizeClasses.padding}`}>
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.koreanName}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
        />
      </div>

      {/* 포켓몬 이름 */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 ${sizeClasses.padding} text-center`}>
        <h3 className={`${sizeClasses.text} font-bold text-gray-800`}>{pokemon.koreanName}</h3>
        <p className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-600`}>{pokemon.name}</p>
      </div>

      {/* 장식적 요소 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* 빛나는 효과 */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-40 rounded-full blur-sm"></div>
        <div className="absolute top-6 left-6 w-4 h-4 bg-white bg-opacity-60 rounded-full blur-sm"></div>
        
        {/* 레전더리 포켓몬일 경우 특별한 효과 */}
        {pokemon.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20"
            animate={{ 
              x: ['-100%', '100%'] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              ease: 'linear' 
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default PokemonImageCard;