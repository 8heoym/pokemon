#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Pokemon Math Adventure - Production Deployment');
console.log('버전:', new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001');

const deploymentVersion = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;

console.log('\n1. 환경 설정 확인...');
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.log('⚠️  NEXT_PUBLIC_BACKEND_URL이 설정되지 않았습니다.');
  console.log('Railway 백엔드 URL을 확인하고 환경변수를 설정해주세요.');
}

console.log('\n2. 의존성 설치...');
try {
  execSync('npm ci', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 의존성 설치 실패:', error.message);
  process.exit(1);
}

console.log('\n3. 빌드 수행...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 빌드 실패:', error.message);
  process.exit(1);
}

console.log('\n4. 배포 버전 정보 생성...');
const versionInfo = {
  version: deploymentVersion,
  timestamp: new Date().toISOString(),
  node_version: process.version,
  next_version: '14.2.32'
};

fs.writeFileSync(
  path.join(__dirname, 'public', 'version.json'), 
  JSON.stringify(versionInfo, null, 2)
);

console.log('\n✅ 배포 준비 완료!');
console.log('📋 배포 정보:');
console.log(`   - 버전: ${deploymentVersion}`);
console.log(`   - 빌드 시간: ${new Date().toISOString()}`);
console.log(`   - Next.js: 14.2.32`);
console.log('\n💡 이제 Vercel에 배포하면 캐시 문제 없이 최신 코드가 적용됩니다.');