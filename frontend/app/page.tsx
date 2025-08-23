'use client';

import { useState } from 'react';
import { User } from '@/types';
import { userAPI } from '@/utils/api';
import WelcomeScreen from '@/components/WelcomeScreen';
import GameDashboard from '@/components/GameDashboard';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCreateUser = async (nickname: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await userAPI.create(nickname);
      const newUser = response.data.user;
      
      setCurrentUser(newUser);
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('pokemonMathUser', JSON.stringify(newUser));
      
    } catch (error: any) {
      setError(error.response?.data?.error || '사용자 생성에 실패했습니다.');
      console.error('User creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await userAPI.get(userId);
      const user = response.data;
      
      setCurrentUser(user);
      
      // 로컬 스토리지 업데이트
      localStorage.setItem('pokemonMathUser', JSON.stringify(user));
      
    } catch (error: any) {
      setError(error.response?.data?.error || '사용자 정보를 불러올 수 없습니다.');
      console.error('User loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 확인
  useState(() => {
    const savedUser = localStorage.getItem('pokemonMathUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // 최신 정보로 업데이트
        handleLoadUser(user.id);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('pokemonMathUser');
      }
    }
  });

  if (isLoading) {
    return <LoadingScreen message="포켓몬 세계로 입장하는 중..." />;
  }

  if (!currentUser) {
    return (
      <WelcomeScreen 
        onCreateUser={handleCreateUser}
        onLoadUser={handleLoadUser}
        error={error}
        isLoading={isLoading}
      />
    );
  }

  return (
    <GameDashboard 
      user={currentUser}
      onUserUpdate={setCurrentUser}
      onLogout={() => {
        setCurrentUser(null);
        localStorage.removeItem('pokemonMathUser');
      }}
    />
  );
}