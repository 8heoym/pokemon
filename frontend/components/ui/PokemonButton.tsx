import React from 'react';
import { motion } from 'framer-motion';

export interface PokemonButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'legendary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * 🎮 PokemonButton - 재사용 가능한 버튼 컴포넌트
 * 
 * 기존에 모든 컴포넌트에 하드코딩된 버튼 스타일을 통합:
 * - font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105
 * - bg-gradient-to-r from-blue-500 to-purple-600 text-white
 * - bg-gradient-to-r from-green-500 to-blue-500 text-white
 */
export const PokemonButton: React.FC<PokemonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseStyles = `
    font-bold rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600 text-white 
      hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105
      focus:ring-blue-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-blue-500 text-white 
      hover:from-green-600 hover:to-blue-600 hover:shadow-lg hover:scale-105
      focus:ring-green-500
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-orange-500 text-white 
      hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg hover:scale-105
      focus:ring-yellow-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 text-white 
      hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:scale-105
      focus:ring-red-500
    `,
    outline: `
      border-2 border-blue-500 text-blue-500 bg-transparent
      hover:bg-blue-50 hover:scale-105 hover:shadow-md
      focus:ring-blue-500
    `,
    ghost: `
      text-blue-600 bg-transparent
      hover:bg-blue-50 hover:text-blue-700 hover:scale-105
      focus:ring-blue-500
    `,
    legendary: `
      bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900
      shadow-lg shadow-yellow-500/25
      hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:scale-105
      hover:shadow-xl hover:shadow-yellow-500/40
      focus:ring-yellow-500
      border border-yellow-600
    `
  };

  const sizes = {
    xs: 'py-1.5 px-3 text-xs',
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
    xl: 'py-5 px-10 text-xl'
  };

  const buttonClassName = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className={`
        inline-flex items-center
        ${position === 'left' ? 'mr-2' : 'ml-2'}
      `}>
        {icon}
      </span>
    );
  };

  const renderContent = () => (
    <>
      {renderIcon('left')}
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          처리중...
        </div>
      ) : (
        children
      )}
      {renderIcon('right')}
    </>
  );

  return (
    <motion.button
      className={buttonClassName}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      whileHover={disabled || loading ? {} : { scale: 1.05 }}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {renderContent()}
    </motion.button>
  );
};

// 특화된 포켓몬 버튼 컴포넌트들
export const PokemonCatchButton: React.FC<Omit<PokemonButtonProps, 'variant'>> = (props) => (
  <PokemonButton {...props} variant="success" icon="🔴" />
);

export const PokemonBattleButton: React.FC<Omit<PokemonButtonProps, 'variant'>> = (props) => (
  <PokemonButton {...props} variant="danger" icon="⚔️" />
);

export const PokemonLegendaryButton: React.FC<Omit<PokemonButtonProps, 'variant'>> = (props) => (
  <PokemonButton {...props} variant="legendary" icon="✨" />
);

export const PokemonSubmitButton: React.FC<Omit<PokemonButtonProps, 'variant' | 'size'>> = (props) => (
  <PokemonButton {...props} variant="primary" size="lg" fullWidth />
);

export default PokemonButton;