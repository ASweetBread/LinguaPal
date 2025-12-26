-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    current_level VARCHAR(10) DEFAULT 'A1',
    daily_goal INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    total_study_minutes INTEGER DEFAULT 0,
    vocabulary_ability TEXT
);

-- 关键词表
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- 错误记录表
CREATE TABLE error_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phrase_meaning_id INTEGER REFERENCES phrase_meanings(id) ON DELETE SET NULL,
    error_type VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_sentence TEXT NOT NULL,
    correct_sentence TEXT NOT NULL,
    severity_level INTEGER DEFAULT 1
);
CREATE INDEX idx_error_user_time ON error_records(user_id, occurred_at);

-- 单词表
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    phonetic VARCHAR(255),
    meanings TEXT NOT NULL,
    part_of_speech VARCHAR(50),
    difficulty_level VARCHAR(10),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word)
);

-- 短语表
CREATE TABLE phrases (
    id SERIAL PRIMARY KEY,
    phrase VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phrase)
);

-- 短语含义表
CREATE TABLE phrase_meanings (
    id SERIAL PRIMARY KEY,
    meaning TEXT NOT NULL,
    context_keyword VARCHAR(255) NOT NULL,
    phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    mastery_level INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP,
    total_practice_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    consecutive_correct INTEGER DEFAULT 0,
    
    next_review_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
    current_interval_days INTEGER DEFAULT 1,
    review_round INTEGER DEFAULT 0,
    
    UNIQUE(user_id, phrase_id, meaning)
);
CREATE INDEX idx_user_review ON phrase_meanings(user_id, next_review_at);

-- 单词短语关联表
CREATE TABLE word_phrase_relations (
    id SERIAL PRIMARY KEY,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
    UNIQUE(word_id, phrase_id)
);

-- 学习进度统计表
CREATE TABLE learning_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stat_date DATE DEFAULT CURRENT_DATE,
    phrases_learned_count INTEGER DEFAULT 0,
    phrases_to_review_count INTEGER DEFAULT 0,
    UNIQUE(user_id, stat_date)
);

-- 今日复习明细表
CREATE TABLE today_review_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);
CREATE INDEX idx_user_status_scheduled ON today_review_details(user_id, status, scheduled_at);