/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'pokemonkorea.co.kr',
      'www.pokemonkorea.co.kr'
    ],
  },
  // Remove env section - use .env files instead for better security
}

module.exports = nextConfig