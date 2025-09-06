import React from 'react';
import { motion } from 'framer-motion';

export interface PokemonCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'battle' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * 🎨 PokemonCard - 재사용 가능한 카드 컴포넌트
 * 
 * 기존에 모든 컴포넌트에 하드코딩된 카드 스타일을 통합:
 * - bg-white rounded-xl p-6 shadow-lg
 * - bg-gradient-to-r from-green-500 to-blue-500
 * - bg-white/10 backdrop-blur-md
 */
export const PokemonCard: React.FC<PokemonCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = true,
  onClick,
  loading = false,
  disabled = false,
  ...props
}) => {
  const variants = {
    default: 'bg-white rounded-xl shadow-lg border border-gray-200',
    gradient: 'bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-xl border border-blue-200',
    glass: 'bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg',
    battle: 'bg-gradient-to-r from-red-100 to-orange-100 rounded-xl shadow-xl border border-red-300',
    compact: 'bg-gray-50 rounded-lg shadow-sm border border-gray-100'
  };

  const sizes = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const hoverEffects = hover && !disabled ? 
    'hover:shadow-xl hover:scale-[1.02] transform transition-all duration-200' : '';

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const clickableStyles = onClick && !disabled ? 'cursor-pointer' : '';

  const cardClassName = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${hoverEffects} 
    ${disabledStyles} 
    ${clickableStyles}
    ${className}
  `.trim();

  const CardComponent = onClick ? motion.div : 'div';

  const motionProps = onClick ? {
    whileHover: disabled ? {} : { scale: 1.02 },
    whileTap: disabled ? {} : { scale: 0.98 },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={cardClassName}
      onClick={disabled ? undefined : onClick}
      {...(onClick ? motionProps : {})}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </CardComponent>
  );
};

// 특화된 포켓몬 카드 컴포넌트들
export const PokemonBattleCard: React.FC<Omit<PokemonCardProps, 'variant'>> = (props) => (
  <PokemonCard {...props} variant="battle" />
);

export const PokemonInfoCard: React.FC<Omit<PokemonCardProps, 'variant'>> = (props) => (
  <PokemonCard {...props} variant="gradient" />
);

export const PokemonStatsCard: React.FC<Omit<PokemonCardProps, 'variant' | 'size'>> = (props) => (
  <PokemonCard {...props} variant="glass" size="sm" />
);

export default PokemonCard;