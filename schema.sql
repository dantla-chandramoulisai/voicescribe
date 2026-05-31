-- ─────────────────────────────────────────────────────────────
-- VoiceScribe Database Schema
-- Run this in MySQL before starting the backend
-- ─────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS voicescribe_db;
USE voicescribe_db;

CREATE TABLE IF NOT EXISTS transcriptions (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    transcribed_text TEXT         NOT NULL,
    source_type      VARCHAR(20)  NOT NULL COMMENT 'microphone or file',
    file_name        VARCHAR(255),
    duration_seconds INT,
    word_count       INT,
    confidence       DOUBLE,
    language         VARCHAR(10)  DEFAULT 'en-US',
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast ordering by date
CREATE INDEX idx_created_at ON transcriptions(created_at DESC);

-- Sample data (optional — remove in production)
INSERT INTO transcriptions (transcribed_text, source_type, word_count, language)
VALUES ('Welcome to VoiceScribe. Your speech has been successfully converted to text.', 'microphone', 12, 'en-US');
