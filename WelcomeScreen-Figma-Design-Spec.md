# Pokemon Math Adventure - WelcomeScreen Figma 디자인 스펙

## 📋 전체 페이지 구조

### Container (메인 컨테이너)
- **크기**: Full Screen (1440x1024px 권장)
- **배경**: Gradient (135도, #667eea → #764ba2)
- **레이아웃**: Flexbox - Center Aligned (both horizontal/vertical)
- **패딩**: 16px (전체 여백)

### Main Card (중앙 카드)
- **크기**: 최대 448px (max-w-md), 반응형
- **배경**: Semi-transparent White (rgba(255,255,255,0.95))
- **Backdrop Filter**: Blur(10px)
- **Border Radius**: 20px
- **Box Shadow**: 0 8px 32px rgba(0,0,0,0.1)
- **Border**: 1px solid rgba(255,255,255,0.18)
- **패딩**: 32px (p-8)
- **텍스트 정렬**: Center

## 🎨 컴포넌트별 상세 스펙

### 1. 헤더 섹션 (Pokemon Logo & Title)

#### Logo Container
- **높이**: 80px (md: 96px, lg: 112px)
- **이미지**: Pokemon 공식 로고
- **Drop Shadow**: 0 4px 6px rgba(0,0,0,0.1)
- **Hover Effect**: Scale(1.05), Transition 300ms

#### 데코레이션 요소들
- **위치**: 절대 위치 (absolute positioning)
- **요소들**:
  - ⚡ (상단 좌측): -8px top, -16px left, bounce animation (delay: 100ms)
  - 🔥 (상단 우측): -8px top, -16px right, bounce animation (delay: 300ms)
  - ⭐ (하단 중앙): -8px bottom, center, bounce animation (delay: 500ms)
- **애니메이션**: infinite bounce, 2초 주기

#### 메인 타이틀
- **텍스트**: "수학 모험 게임"
- **폰트 크기**: 30px (text-3xl)
- **폰트 굵기**: Bold
- **색상**: Gradient (45도, #3B82F6 → #8B5CF6 → #EC4899)
- **배경 클립**: text
- **마진**: 8px bottom
- **Hover Effect**: Scale(1.05), Spring animation

#### 서브 타이틀
- **텍스트**: "🎮 포켓몬과 함께 구구단을 마스터하자! 🎯"
- **폰트 크기**: 18px (text-lg)
- **폰트 굵기**: Medium
- **색상**: #6B7280 (text-gray-600)
- **마진**: 32px bottom

### 2. 모드 선택 버튼 섹션

#### 버튼 컨테이너
- **레이아웃**: Flex, 16px gap
- **마진**: 24px bottom

#### 새로 시작하기 버튼 (Active State)
- **색상**: Gradient (Red, #EF4444 → #DC2626)
- **텍스트 색상**: White
- **Shadow**: Red-300 (0 4px 14px rgba(252,165,165,0.4))

#### 새로 시작하기 버튼 (Inactive State)
- **색상**: Gradient (Gray-100 → White)
- **텍스트 색상**: #EF4444
- **Border**: 2px solid #FECACA (red-200)
- **Hover**: Background to red-50 → red-100

#### 이어서 하기 버튼 (Active State)
- **색상**: Gradient (Blue, #3B82F6 → #2563EB)
- **텍스트 색상**: White
- **Shadow**: Blue-300 (0 4px 14px rgba(147,197,253,0.4))

#### 이어서 하기 버튼 (Inactive State)
- **색상**: Gradient (Gray-100 → White)
- **텍스트 색상**: #3B82F6
- **Border**: 2px solid #BFDBFE (blue-200)
- **Hover**: Background to blue-50 → blue-100

#### 공통 버튼 스타일
- **크기**: Flex-1 (동일한 너비), 16px vertical padding, 24px horizontal padding
- **Border Radius**: 12px
- **폰트 굵기**: Bold
- **Shadow**: Large (0 10px 25px)
- **Hover Effect**: Y축 -2px 이동, Scale(1.05)
- **Tap Effect**: Scale(0.95)
- **Transition**: 300ms all

### 3. 입력 폼 섹션

#### Label
- **텍스트**: "트레이너 닉네임" / "닉네임"
- **색상**: #374151 (text-gray-700)
- **폰트 굵기**: Bold
- **마진**: 8px bottom
- **정렬**: Left

#### Input Field
- **너비**: 100%
- **패딩**: 16px
- **폰트 크기**: 24px
- **텍스트 정렬**: Center
- **Border**: 2px solid #93C5FD (blue-300)
- **Border Radius**: 12px
- **배경색**: White (#FFFFFF)
- **텍스트 색상**: Black (#000000)
- **폰트 굵기**: Bold (700)
- **Box Shadow**: Inset 0 2px 4px rgba(0,0,0,0.05)
- **Focus State**: Border color #3B82F6 (blue-500)

#### Placeholder 스타일
- **색상**: #9CA3AF (gray-400)
- **투명도**: 0.7
- **텍스트**: "예: 지우, 웅이, 이슬이..." / "이전에 사용한 닉네임을 입력하세요"

#### Helper Text
- **폰트 크기**: 14px
- **색상**: #6B7280 (gray-500)
- **마진**: 4px top
- **정렬**: Left
- **텍스트**: 
  - 새 게임: "🎮 포켓몬 세계에서 사용할 이름을 입력해주세요"
  - 기존 게임: "🔍 이전에 생성한 닉네임을 입력하면 계속 플레이할 수 있어요"

### 4. 제출 버튼

#### 새 게임 모드 버튼
- **배경**: Gradient (Yellow, #FBBF24 → #F59E0B → #D97706)
- **텍스트 색상**: Black
- **Shadow**: Yellow-300 (0 4px 14px rgba(252,211,77,0.4))
- **Hover**: Yellow-500 → Yellow-600 → Yellow-700 gradient

#### 기존 게임 모드 버튼
- **배경**: Gradient (Green, #10B981 → #059669 → #047857)
- **텍스트 색상**: White
- **Shadow**: Green-300 (0 4px 14px rgba(134,239,172,0.4))
- **Hover**: Green-500 → Green-600 → Green-700 gradient

#### 공통 버튼 스타일
- **너비**: 100%
- **패딩**: 16px vertical, 24px horizontal
- **Border Radius**: 12px
- **폰트 굵기**: Bold
- **폰트 크기**: 18px
- **Shadow**: Large
- **Hover Effect**: Y축 -2px 이동, Scale(1.02), 더 큰 그림자
- **Tap Effect**: Scale(0.98)
- **Transition**: 300ms all

#### 로딩 상태
- **배경**: Gray-400
- **투명도**: 0.5
- **Cursor**: not-allowed
- **애니메이션**: 회전하는 스피너 (6px x 6px, 4px border, gray-600 색상)

### 5. 게임 소개 섹션

#### Container
- **마진**: 32px top
- **패딩**: 16px
- **배경**: #EFF6FF (blue-50)
- **Border Radius**: 8px

#### 제목
- **텍스트**: "🎯 게임 소개"
- **색상**: #1D4ED8 (blue-700)
- **폰트 굵기**: Bold
- **마진**: 8px bottom

#### 소개 리스트
- **폰트 크기**: 14px
- **색상**: #2563EB (blue-600)
- **라인 간격**: 4px
- **내용**:
  - "• 포켓몬과 함께 구구단을 배워요"
  - "• 문제를 맞추면 포켓몬을 잡을 수 있어요"
  - "• 지역별로 다른 포켓몬들이 기다려요"
  - "• 레벨업하고 포켓몬 마스터가 되어보세요!"

### 6. 푸터 섹션

#### 개발자 정보
- **텍스트**: "초등학교 2학년 수학 교육용 게임"
- **폰트 크기**: 12px
- **색상**: #9CA3AF (gray-400)
- **마진**: 24px top

## 🎭 애니메이션 스펙

### 페이지 로드 애니메이션
1. **Main Card**: Scale(0.8) → Scale(1), Opacity(0) → Opacity(1), 500ms
2. **Logo Section**: Y(-20px) → Y(0), Opacity(0) → Opacity(1), 500ms, 200ms delay
3. **Mode Buttons**: Y(20px) → Y(0), Opacity(0) → Opacity(1), 500ms, 400ms delay
4. **Form**: Y(20px) → Y(0), Opacity(0) → Opacity(1), 500ms, 600ms delay
5. **Game Info**: Y(20px) → Y(0), Opacity(0) → Opacity(1), 500ms, 800ms delay
6. **Footer**: Opacity(0) → Opacity(1), 500ms, 1000ms delay

### Hover 애니메이션
- **로고**: Scale(1.05), 300ms ease
- **제목**: Scale(1.05), spring physics
- **버튼들**: Y축 -2px 이동, Scale 효과, 300ms ease
- **제출 버튼**: Y축 -2px, Scale(1.02), shadow 확대

### 터치/클릭 애니메이션
- **모든 버튼**: Scale(0.95) → Scale(1), 150ms ease

## 🎨 컬러 팔레트

### Primary Colors
- **Blue**: #3B82F6, #2563EB, #1D4ED8
- **Red**: #EF4444, #DC2626
- **Yellow**: #FBBF24, #F59E0B, #D97706
- **Green**: #10B981, #059669, #047857

### Secondary Colors
- **Purple**: #8B5CF6, #7C3AED
- **Gray**: #6B7280, #9CA3AF, #374151

### Background
- **Gradient**: #667eea → #764ba2 (135deg)
- **Card**: rgba(255,255,255,0.95)

## 📱 반응형 디자인

### Desktop (1440px+)
- Logo 높이: 112px
- Card 최대 너비: 448px

### Tablet (768px ~ 1439px)
- Logo 높이: 96px
- Card 최대 너비: 448px

### Mobile (~767px)
- Logo 높이: 80px
- Card 너비: 계산된 너비 (여백 16px 제외)
- 버튼 스택: 세로 배치로 변경 고려

## 🔧 Figma 제작 팁

1. **Auto Layout 사용**: 모든 섹션에 Auto Layout 적용
2. **Component 생성**: 버튼들을 컴포넌트로 만들어 variant 활용
3. **Gradient 적용**: Background fill에서 Linear gradient 설정
4. **Drop Shadow**: Effect → Drop Shadow로 그림자 효과 적용
5. **Text Gradient**: Fill에서 gradient 적용 후 stroke도 추가
6. **Animation**: Prototype에서 Smart Animate 사용
7. **Auto Layout Gap**: 요소 간 간격은 gap으로 설정
8. **Constraints 설정**: 반응형을 위한 제약 조건 설정

## 📊 측정 단위 변환표

| CSS (px) | Figma (px) | CSS Class |
|----------|------------|-----------|
| 12px | 12px | text-xs |
| 14px | 14px | text-sm |
| 16px | 16px | text-base |
| 18px | 18px | text-lg |
| 20px | 20px | text-xl |
| 24px | 24px | text-2xl |
| 30px | 30px | text-3xl |
| 8px | 8px | p-2, m-2 |
| 16px | 16px | p-4, m-4 |
| 24px | 24px | p-6, m-6 |
| 32px | 32px | p-8, m-8 |

이 스펙을 바탕으로 Figma에서 WelcomeScreen을 완벽하게 재현할 수 있습니다.