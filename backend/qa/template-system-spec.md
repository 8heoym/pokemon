# 템플릿 시스템 기능 명세서

## 개요
포켓몬 수학 게임의 새로운 템플릿 기반 문제 생성 시스템 명세서

## 핵심 기능

### 1. 템플릿 기반 문제 생성

#### 1.1 템플릿 구조
```typescript
interface ProblemTemplate {
  id: string;                    // UUID
  name: string;                  // "그룹 세기 - 기본"
  category: string;              // "GROUP_COUNT"
  storyTemplate: string;         // "{pokemon}가 {a}마리씩 {b}그룹에 있어요..."
  hintTemplate: string;          // "{a} × {b}를 계산해보세요!"
  equationTemplate: string;      // "{a} × {b}"
  variables: object;             // {a: {min: 2, max: 9}, b: {min: 2, max: 9}}
  units: string[];               // ["마리", "개"]
  applicableTables: number[];    // [2,3,4,5,6,7,8,9]
  difficulty: 1 | 2 | 3;
  qualityScore: number;          // 0.0 - 1.0
  isActive: boolean;
}
```

#### 1.2 변수 생성 규칙
- `a` 변수: 구구단 숫자로 고정 (예: 3단이면 a=3)
- `b` 변수: 템플릿 범위 내에서 랜덤 생성
- `answer`: a × b 자동 계산
- `unit`: 템플릿 단위 배열에서 랜덤 선택

#### 1.3 포켓몬 치환 메커니즘
- `{pokemon}` → 선택된 포켓몬의 koreanName
- `{pokemonName}` → 선택된 포켓몬의 name (영문)
- 구구단별 포켓몬 매핑 활용

### 2. 하이브리드 생성 전략

#### 2.1 전략 결정 알고리즘
```
if (availableTemplates.count >= 3) {
  strategy = TEMPLATE_PRIORITY
} else if (availableTemplates.count >= 1 && userSolvedCount > 10) {
  strategy = HYBRID_ENHANCED
} else {
  strategy = AI_PERSONALIZED
}
```

#### 2.2 전략별 동작
- **TEMPLATE_PRIORITY**: 품질점수 높은 템플릿 우선 선택
- **HYBRID_ENHANCED**: 60% 템플릿, 40% AI 생성 (랜덤)
- **AI_PERSONALIZED**: 기존 AI 생성 방식 사용

### 3. 세션 관리

#### 3.1 문제 인스턴스 생명주기
- 생성: `/api/problems/generate` 호출 시
- 저장: `problem_instances` 테이블에 30분 TTL
- 조회: `getProblemFromSession()` - userId + problemId 매칭
- 완료: `submitAnswer()` 시 is_answered=true 마킹
- 만료: expires_at 시간 경과 시 자동 제거

#### 3.2 세션 정리 메커니즘
- 사용자당 하나의 활성 문제만 유지
- 새 문제 생성 시 이전 미답변 문제 삭제
- 답변 완료 또는 만료 시 세션 정리

### 4. 사용자 학습 이력 관리

#### 4.1 템플릿 재사용 방지
- 최근 7일간 사용한 템플릿 제외
- 구구단별 개별 추적
- `user_template_history` 테이블 활용

#### 4.2 성능 통계 수집
- 템플릿별 정답률, 평균 시간 추적
- RPC 함수를 통한 효율적 업데이트
- 품질 점수 개선을 위한 데이터 수집

### 5. 폴백 메커니즘

#### 5.1 템플릿 시스템 장애 대응
- 템플릿 조회 실패 → AI 생성으로 자동 폴백
- 데이터베이스 연결 오류 → 기존 메모리 캐시 방식 사용
- 세션 저장 실패 → 임시 메모리 저장 후 재시도

#### 5.2 오류 복구 전략
- 단계별 오류 처리로 완전 실패 방지
- 사용자에게 투명한 오류 메시지 제공
- 로그 기반 장애 분석 지원

## API 인터페이스

### 문제 생성 API
**POST** `/api/problems/generate`
```json
{
  "userId": "string",
  "multiplicationTable": "number (2-9)",
  "difficulty": "number (1-3)"
}
```

**Response**
```json
{
  "problem": {
    "id": "uuid",
    "story": "피카츄가 3마리씩 4그룹에 있어요...",
    "hint": "3 × 4를 계산해보세요!",
    "equation": "3 × 4",
    "answer": 12,
    "multiplicationTable": 3,
    "pokemonId": 25,
    "difficulty": 1,
    "visualElements": {...}
  },
  "pokemon": {...}
}
```

### 답안 제출 API  
**POST** `/api/problems/submit`
```json
{
  "userId": "string",
  "problemId": "uuid",
  "answer": "number",
  "timeSpent": "number",
  "hintsUsed": "number"
}
```

**Response**
```json
{
  "isCorrect": "boolean",
  "correctAnswer": "number", 
  "pokemonCaught": "object | null",
  "experienceGained": "number",
  "feedback": "string"
}
```

## 데이터베이스 스키마

### 핵심 테이블
1. **problem_templates**: 템플릿 정의 및 메타데이터
2. **problem_instances**: 생성된 문제 인스턴스 (세션)
3. **user_template_history**: 사용자별 템플릿 사용 이력

### 관계도
```
users (1) ←→ (N) problem_instances ←→ (1) problem_templates
users (1) ←→ (N) user_template_history ←→ (1) problem_templates
```

## 품질 보증 요구사항

### 1. 기능적 요구사항
- 템플릿 기반 문제가 수학적으로 정확해야 함
- 포켓몬 치환이 의미적으로 자연스러워야 함
- 세션 만료 처리가 정확해야 함
- 사용자별 템플릿 재사용 방지가 동작해야 함

### 2. 성능 요구사항
- 문제 생성 응답시간 < 2초
- 동시 사용자 100명 지원
- 메모리 사용량 안정성
- 데이터베이스 쿼리 최적화

### 3. 호환성 요구사항
- 기존 AI 생성 방식과의 하위 호환성
- API 응답 형식 일관성 유지
- 프론트엔드 인터페이스 변경 최소화

### 4. 신뢰성 요구사항
- 99% 가용성 목표
- 장애 시 자동 폴백 동작
- 데이터 무결성 보장
- 오류 로그 및 모니터링