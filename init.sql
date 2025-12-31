-- 插入测试用户数据
INSERT INTO users (username, password, current_level, daily_goal, total_study_minutes, vocabulary_ability)
VALUES ('testuser', 'testpassword', 'A2', 10, 300, '中级学习者')
ON CONFLICT (username) DO NOTHING;

-- 插入测试配置数据，使用刚插入的用户ID
INSERT INTO configs (user_id, mode, ai_text_service, ai_asr_service, ai_tts_service, dialogue_new_word_ratio, dialogue_familiar_word_level)
VALUES ((SELECT id FROM users WHERE username = 'testuser'), 'normal', 'zhipu', 'zhipu', 'browser', 30, 3)
ON CONFLICT (user_id) DO NOTHING;
