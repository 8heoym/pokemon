# WelcomeScreen 컴포넌트 구조 및 Figma 레이어 계층

## 🏗️ Figma 레이어 구조

```
🖼️ WelcomeScreen (Frame 1440x1024)
├── 🌈 Background (Fill: Linear Gradient)
└── 📦 Main Container (Auto Layout)
    └── 🃏 Pokemon Card (Auto Layout Vertical)
        ├── 🎯 Header Section (Auto Layout Vertical)
        │   ├── 🎨 Logo Container (Auto Layout)
        │   │   ├── 🖼️ Pokemon Logo (Image)
        │   │   ├── ⚡ Decoration Lightning (Text)
        │   │   ├── 🔥 Decoration Fire (Text)
        │   │   └── ⭐ Decoration Star (Text)
        │   ├── 📝 Main Title (Text - Gradient Fill)
        │   └── 📄 Subtitle (Text)
        ├── 🎮 Mode Selection (Auto Layout Vertical)
        │   └── 🔘 Button Container (Auto Layout Horizontal)
        │       ├── 🆕 New Game Button (Component)
        │       │   ├── 🎯 Button Background (Rectangle)
        │       │   ├── 🏷️ Button Content (Auto Layout)
        │       │   │   ├── ⚪ Icon (Text)
        │       │   │   └── 📝 Label (Text)
        │       │   └── 📄 Description (Text)
        │       └── 🔄 Continue Button (Component)
        │           ├── 🎯 Button Background (Rectangle)
        │           ├── 🏷️ Button Content (Auto Layout)
        │           │   ├── 🔵 Icon (Text)
        │           │   └── 📝 Label (Text)
        │           └── 📄 Description (Text)
        ├── 📝 Input Form (Auto Layout Vertical)
        │   ├── 🏷️ Form Label (Text)
        │   ├── 📝 Input Field (Component)
        │   │   ├── 📦 Input Background (Rectangle)
        │   │   └── 📝 Input Text (Text)
        │   ├── 💡 Helper Text (Text)
        │   └── ⚠️ Error Message (Component - Conditional)
        ├── 🚀 Submit Button (Component)
        │   ├── 🎨 Button Background (Rectangle)
        │   └── 📝 Button Content (Auto Layout)
        │       ├── ⚡ Left Icon (Text)
        │       ├── 📝 Button Text (Text)
        │       └── 🚀 Right Icon (Text)
        ├── 📚 Game Info Section (Auto Layout Vertical)
        │   ├── 🎯 Info Title (Text)
        │   └── 📋 Info List (Auto Layout Vertical)
        │       ├── • Feature 1 (Text)
        │       ├── • Feature 2 (Text)
        │       ├── • Feature 3 (Text)
        │       └── • Feature 4 (Text)
        └── 👤 Footer (Text)
```

## 📐 컴포넌트별 Auto Layout 설정

### 1. Main Container
- **Direction**: Vertical
- **Alignment**: Center
- **Padding**: 16px all sides
- **Fill**: Container width/height
- **Constraints**: Center

### 2. Pokemon Card
- **Direction**: Vertical
- **Gap**: 24px (6 units)
- **Padding**: 32px all sides
- **Max Width**: 448px
- **Alignment**: Center
- **Fill**: Fixed width
- **Corner Radius**: 20px

### 3. Header Section
- **Direction**: Vertical
- **Gap**: 8px
- **Alignment**: Center
- **Fill**: Container width

### 4. Logo Container
- **Direction**: Vertical
- **Gap**: 16px
- **Alignment**: Center
- **Position**: Relative (for absolute decorations)

### 5. Button Container (Mode Selection)
- **Direction**: Horizontal
- **Gap**: 16px
- **Fill**: Container width
- **Distribution**: Fill equally

### 6. Individual Buttons
- **Direction**: Vertical
- **Gap**: 4px
- **Padding**: 16px vertical, 24px horizontal
- **Alignment**: Center
- **Fill**: Container width
- **Corner Radius**: 12px

### 7. Input Form
- **Direction**: Vertical
- **Gap**: 8px
- **Fill**: Container width
- **Alignment**: Fill

### 8. Submit Button
- **Direction**: Horizontal
- **Gap**: 8px
- **Padding**: 16px vertical, 24px horizontal
- **Alignment**: Center
- **Fill**: Container width
- **Corner Radius**: 12px

### 9. Game Info Section
- **Direction**: Vertical
- **Gap**: 8px
- **Padding**: 16px all sides
- **Fill**: Container width
- **Corner Radius**: 8px
- **Background**: Blue-50

## 🎨 컴포넌트 State 관리

### Mode Selection Buttons
**Variants**: 
- `State`: Active, Inactive
- `Type`: New Game, Continue Game

#### New Game Button
- **Active**: Red gradient background, white text
- **Inactive**: Gray background, red text, red border

#### Continue Button  
- **Active**: Blue gradient background, white text
- **Inactive**: Gray background, blue text, blue border

### Submit Button
**Variants**:
- `Mode`: New Game, Continue Game  
- `State`: Default, Loading, Disabled

#### New Game Mode
- **Background**: Yellow gradient
- **Text**: Black
- **Icons**: ⚡ + 🚀

#### Continue Mode
- **Background**: Green gradient  
- **Text**: White
- **Icons**: 🔓 + 📂

#### Loading State
- **Background**: Gray
- **Text**: "포켓몬 세계로 이동 중..."
- **Icon**: Spinning loader

### Input Field
**States**:
- Default: Blue border
- Focus: Darker blue border
- Error: Red border (when error state)

## 📱 반응형 Breakpoints

### Desktop (1440px)
- Logo Height: 112px
- Card Max Width: 448px
- Font Scale: 1.0x

### Tablet (768px)  
- Logo Height: 96px
- Card Max Width: 448px
- Font Scale: 0.9x

### Mobile (375px)
- Logo Height: 80px
- Card Width: Fill with 16px margins
- Font Scale: 0.8x
- Button Layout: Consider stacking vertically

## 🎭 프로토타입 인터랙션

### 페이지 로드 시퀀스
1. **Main Card**: Fade In + Scale up (0.8 → 1.0)
2. **Header** (200ms delay): Slide up + Fade in
3. **Mode Buttons** (400ms delay): Slide up + Fade in
4. **Form** (600ms delay): Slide up + Fade in
5. **Game Info** (800ms delay): Slide up + Fade in
6. **Footer** (1000ms delay): Fade in

### 버튼 인터랙션
- **Hover**: Scale 1.05, Move up 2px
- **Tap**: Scale 0.95
- **Mode Switch**: Smart animate between states

### 로고 애니메이션
- **Hover**: Scale 1.05, 300ms ease-out
- **Decorations**: Continuous bounce (2s loop)

## 🔧 Figma 제작 단계별 가이드

### Step 1: 기본 구조 생성
1. Frame 생성 (1440x1024)
2. Background gradient 적용
3. Main Container (Auto Layout) 생성
4. Pokemon Card 컨테이너 생성

### Step 2: 헤더 섹션
1. Pokemon 로고 이미지 삽입
2. 데코레이션 이모지 배치 (absolute position)
3. 그라데이션 텍스트 제목 생성
4. 서브타이틀 추가

### Step 3: 모드 선택 버튼
1. 버튼 컴포넌트 생성
2. Variant 설정 (Active/Inactive, New/Continue)
3. Auto Layout으로 배치
4. 그라데이션 배경 적용

### Step 4: 입력 폼
1. 라벨 및 입력 필드 생성
2. Input 컴포넌트화 (State variants)
3. Helper text 추가
4. 에러 메시지 컴포넌트 생성

### Step 5: 제출 버튼
1. 버튼 컴포넌트 생성
2. Mode variants 설정
3. 아이콘 + 텍스트 레이아웃
4. 로딩 상태 변형 추가

### Step 6: 게임 소개 & 푸터
1. 정보 섹션 배경 설정
2. 리스트 항목들 배치
3. 푸터 텍스트 추가

### Step 7: 프로토타입
1. Smart animate 연결
2. 페이지 로드 애니메이션 설정
3. 버튼 hover/tap 상태 연결
4. 모드 전환 애니메이션

### Step 8: 반응형 설정
1. Constraints 설정
2. 브레이크포인트별 frame 복제
3. 요소 크기 조정
4. 모바일 레이아웃 최적화

이 구조를 따라 Figma에서 체계적으로 WelcomeScreen을 재구성할 수 있습니다.