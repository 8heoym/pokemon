/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          blue: '#3B82F6',
          yellow: '#FCD34D',
          red: '#EF4444',
          green: '#10B981',
          purple: '#8B5CF6',
          pink: '#EC4899'
        },
        rarity: {
          common: '#6B7280',
          uncommon: '#10B981',
          rare: '#3B82F6',
          legendary: '#F59E0B'
        }
      },
      fontFamily: {
        'pokemon': ['Comic Sans MS', 'cursive'],
        'game': ['Press Start 2P', 'monospace']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'catch': 'catch 0.8s ease-out',
        'level-up': 'levelUp 1.5s ease-out'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        catch: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.2) rotate(10deg)' },
          '50%': { transform: 'scale(0.8) rotate(-10deg)' },
          '75%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        },
        levelUp: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}