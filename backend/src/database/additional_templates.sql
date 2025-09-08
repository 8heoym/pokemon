-- 더 흥미로운 스토리텔링 템플릿들

-- 1. 모험/탐험 스토리
INSERT INTO problem_templates (
    name, category, 
    story_template, hint_template, equation_template,
    variables, units, applicable_tables, difficulty,
    educational_concept, quality_score, is_active
) VALUES 
(
    '동굴 탐험',
    'ADVENTURE',
    '{pokemon}가 신비한 동굴을 탐험하고 있어요! 각 방마다 보물상자가 {a}개씩 있고, {b}개의 방을 발견했어요. 보물상자는 모두 몇 개일까요?',
    '각 방에 {a}개씩 있고, 방이 {b}개니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "방"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '공간 탐험 개념',
    0.92,
    true
),
(
    '포켓몬 특기 활용',
    'POKEMON_SKILL',
    '피카츄가 번개 공격을 했어요! 한 번에 {a}마리씩 {b}번 공격할 수 있어요. 공격받은 포켓몬은 모두 몇 마리일까요?',
    '{a}마리씩 {b}번이니까 {a} × {b}이에요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "번"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '반복 행동 개념',
    0.95,
    true
),
(
    '친구들과 놀이',
    'FRIENDSHIP',
    '{pokemon}가 친구들과 술래잡기를 해요. {a}마리씩 {b}팀으로 나뉘어서 놀고 있어요. 놀고 있는 포켓몬은 모두 몇 마리일까요?',
    '한 팀에 {a}마리씩, {b}팀이니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "팀"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '집단 분류 개념',
    0.90,
    true
),
(
    '맛있는 간식',
    'COOKING',
    '{pokemon}가 친구들을 위해 쿠키를 구웠어요! 접시마다 {a}개씩 담았는데, {b}개의 접시가 있어요. 쿠키는 모두 몇 개일까요?',
    '접시가 {b}개이고, 각각 {a}개씩...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "접시"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '일상 분배 개념',
    0.88,
    true
),
(
    '꽃밭 가꾸기',
    'GARDENING',
    '{pokemon}가 예쁜 꽃밭을 만들고 있어요. 한 줄에 꽃을 {a}송이씩 심었는데, {b}줄을 만들었어요. 심은 꽃은 모두 몇 송이일까요?',
    '한 줄에 {a}송이씩 {b}줄이니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["송이", "줄"]',
    '{3,4,5,6,7,8,9}',
    2,
    '자연 배열 개념',
    0.85,
    true
),
(
    '운동회 준비',
    'SPORTS',
    '포켓몬 운동회가 열려요! {pokemon}가 응원 깃발을 만드는데, 한 묶음에 {a}개씩 들어있고 {b}묶음을 샀어요. 깃발은 모두 몇 개일까요?',
    '{a}개씩 들어있는 묶음이 {b}개...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "묶음"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '묶음 단위 개념',
    0.87,
    true
),
(
    '날씨와 함께',
    'WEATHER',
    '비가 와서 {pokemon}가 웅덩이를 발견했어요! 각 웅덩이마다 {a}마리씩 올챙이가 있고, {b}개의 웅덩이가 있어요. 올챙이는 모두 몇 마리일까요?',
    '웅덩이마다 {a}마리씩, {b}개의 웅덩이...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "웅덩이"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '자연 관찰 개념',
    0.83,
    true
),
(
    '생일 파티',
    'PARTY',
    '{pokemon}가 생일 파티를 열어요! 친구들에게 나눠줄 선물이 있는데, 한 상자에 {a}개씩 들어있고 {b}상자가 있어요. 선물은 모두 몇 개일까요?',
    '상자마다 {a}개씩, {b}상자니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "상자"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '축제 나눔 개념',
    0.93,
    true
),
(
    '잠자리 이야기',
    'BEDTIME',
    '{pokemon}가 잠들기 전에 별을 세고 있어요. 하늘에서 {a}개씩 반짝이는 별 무리를 {b}개 발견했어요. 별은 모두 몇 개일까요?',
    '별 무리가 {b}개이고, 각각 {a}개씩...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "무리"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '관찰 패턴 개념',
    0.89,
    true
),
(
    '숨바꼭질 게임',
    'HIDE_SEEK',
    '{pokemon}들이 숨바꼭질을 하고 있어요! 나무 뒤에 {a}마리씩 숨었는데, {b}그루의 나무가 있어요. 숨은 포켓몬은 모두 몇 마리일까요?',
    '나무마다 {a}마리씩, {b}그루니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "그루"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '공간 숨김 개념',
    0.91,
    true
);

-- 시각적 요소 업데이트
UPDATE problem_templates SET visual_elements_template = '{
    "layout": "cave_rooms",
    "roomCount": "{b}",
    "treasuresPerRoom": "{a}",
    "totalTreasures": "{answer}",
    "description": "동굴 탐험 시각화"
}' WHERE category = 'ADVENTURE';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "skill_effect",
    "attackCount": "{b}",
    "targetsPerAttack": "{a}",
    "totalTargets": "{answer}",
    "description": "포켓몬 스킬 시각화"
}' WHERE category = 'POKEMON_SKILL';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "team_groups",
    "teamCount": "{b}",
    "membersPerTeam": "{a}",
    "totalMembers": "{answer}",
    "description": "팀 게임 시각화"
}' WHERE category = 'FRIENDSHIP';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "plates",
    "plateCount": "{b}",
    "cookiesPerPlate": "{a}",
    "totalCookies": "{answer}",
    "description": "음식 배분 시각화"
}' WHERE category = 'COOKING';