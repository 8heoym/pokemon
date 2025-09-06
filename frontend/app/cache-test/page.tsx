import CacheTestDashboard from '@/components/CacheTestDashboard';

export const metadata = {
  title: 'Next.js 캐시 성능 테스트 | 포켓몬 수학 모험',
  description: 'Vercel Edge Network 캐시 시스템 성능 측정 도구',
};

export default function CacheTestPage() {
  return <CacheTestDashboard />;
}