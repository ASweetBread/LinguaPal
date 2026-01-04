-- 清库脚本：按照外键依赖顺序删除所有表的数据
-- 删除顺序：先删除子表，再删除父表

-- 删除关联表（依赖其他表的表）
DELETE FROM word_phrase_relations;
DELETE FROM error_records;
DELETE FROM phrase_meanings;
DELETE FROM phrases;
DELETE FROM words;
DELETE FROM keywords;
DELETE FROM learning_stats;
DELETE FROM today_review_details;
DELETE FROM configs;
DELETE FROM users;

-- 插入测试用户数据
INSERT INTO users (username, password, current_level, daily_goal, total_study_minutes, vocabulary_ability)
VALUES ('testuser', 'testpassword', 'A2', 10, 300, '中级学习者')
ON CONFLICT (username) DO NOTHING;

-- 插入测试配置数据，使用刚插入的用户ID
INSERT INTO configs (user_id, mode, ai_text_service, ai_asr_service, ai_tts_service, dialogue_new_word_ratio, dialogue_familiar_word_level)
VALUES ((SELECT id FROM users WHERE username = 'testuser'), 'normal', 'zhipu', 'zhipu', 'browser', 30, 3)
ON CONFLICT (user_id) DO NOTHING;
