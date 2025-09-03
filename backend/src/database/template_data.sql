-- 기본 문제 템플릿 데이터 삽입

-- 1. 그룹 세기 템플릿 (가장 기본적인 곱셈 개념)
INSERT INTO problem_templates (
    name, category, 
    story_template, hint_template, equation_template,
    variables, units, applicable_tables, difficulty,
    educational_concept, quality_score, is_active
) VALUES 
(
    '그룹 세기 - 기본',
    'GROUP_COUNT',
    '{pokemon}가 {a}마리씩 {b}그룹에 있어요. 모두 몇 마리일까요?',
    '{a} × {b}를 계산해보세요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "마리"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '반복덧셈 개념',
    0.9,
    true
),
(
    '아이템 배분하기',
    'ITEM_DISTRIBUTION', 
    '{pokemon}가 {b}개의 상자에 열매를 {a}개씩 넣었어요. 모두 몇 개일까요?',
    '상자가 {b}개 있고, 각 상자에 {a}개씩 있어요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "개"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '배열 개념',
    0.85,
    true
),
(
    '동작 반복하기',
    'ACTION_REPEAT',
    '{pokemon}가 점프를 {a}번씩 {b}번 반복했어요. 총 몇 번 점프했을까요?',
    '{a}번을 {b}번 반복하는 것을 생각해보세요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["번", "번"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '반복 개념',
    0.8,
    true
),
(
    '줄서기 배열',
    'ROW_ARRANGEMENT',
    '{pokemon}들이 {a}마리씩 {b}줄로 서 있어요. 모두 몇 마리일까요?',
    '{a}마리가 {b}줄이니까 {a} × {b}이에요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "줄"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '배열 개념',
    0.88,
    true
),
(
    '층별 분포',
    'FLOOR_DISTRIBUTION',
    '{b}층 건물에서 각 층마다 {pokemon}가 {a}마리씩 살고 있어요. 모두 몇 마리일까요?',
    '{b}층에 각각 {a}마리씩 있다는 뜻이에요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["마리", "층"]',
    '{3,4,5,6,7,8,9}',
    2,
    '공간 개념',
    0.82,
    true
),
(
    '시간별 패턴',
    'TIME_PATTERN',
    '{pokemon}가 하루에 {a}개씩 열매를 먹어요. {b}일 동안 몇 개를 먹을까요?',
    '하루에 {a}개씩 {b}일 동안이니까...',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 7}}',
    '["개", "일"]',
    '{2,3,4,5,6,7,8,9}',
    3,
    '시간 개념',
    0.75,
    true
),
(
    '간단한 곱셈',
    'SIMPLE_MULTIPLY',
    '{pokemon}가 {a}의 {b}배만큼 열매를 가지고 있어요. 몇 개일까요?',
    '{a}의 {b}배는 {a} × {b}와 같아요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["개", "배"]',
    '{2,3,4,5,6,7,8,9}',
    2,
    '배수 개념',
    0.9,
    true
),
(
    '카드 묶음',
    'CARD_BUNDLE',
    '{pokemon} 카드를 {a}장씩 {b}묶음 만들었어요. 모두 몇 장일까요?',
    '{a}장짜리 묶음이 {b}개 있어요!',
    '{a} × {b}',
    '{"a": {"min": 2, "max": 9}, "b": {"min": 2, "max": 9}}',
    '["장", "묶음"]',
    '{2,3,4,5,6,7,8,9}',
    1,
    '분할 개념',
    0.87,
    true
);

-- 시각적 요소 템플릿 추가 (업데이트)
UPDATE problem_templates SET visual_elements_template = '{
    "layout": "grid",
    "pokemonCount": "{a}",
    "groupCount": "{b}", 
    "totalItems": "{answer}",
    "description": "그리드 배열 시각화"
}' WHERE category = 'GROUP_COUNT';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "boxes",
    "boxCount": "{b}",
    "itemsPerBox": "{a}",
    "totalItems": "{answer}",
    "description": "상자 배분 시각화"
}' WHERE category = 'ITEM_DISTRIBUTION';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "sequence",
    "actionCount": "{a}",
    "repeatCount": "{b}",
    "totalActions": "{answer}",
    "description": "동작 반복 시각화"
}' WHERE category = 'ACTION_REPEAT';

UPDATE problem_templates SET visual_elements_template = '{
    "layout": "rows",
    "itemsPerRow": "{a}",
    "rowCount": "{b}",
    "totalItems": "{answer}",
    "description": "줄서기 배열 시각화"
}' WHERE category = 'ROW_ARRANGEMENT';