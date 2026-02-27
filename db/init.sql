-- ============================================================
-- BAIKAL RPA AI  –  PostgreSQL DDL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'user',   -- 'admin' | 'user'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. documents
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type        VARCHAR(50) NOT NULL,               -- 'report' | 'official' | 'email'
    title           VARCHAR(500) NOT NULL,
    input_payload   JSONB NOT NULL DEFAULT '{}',
    output_content  TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. automations
CREATE TABLE automations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    type             VARCHAR(50) NOT NULL,              -- 'web_scrape' | 'excel_process'
    config           JSONB NOT NULL DEFAULT '{}',
    schedule_enabled BOOLEAN NOT NULL DEFAULT false,
    schedule_cron    VARCHAR(100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. automation_runs
CREATE TABLE automation_runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id   UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'queued',  -- queued | running | success | failed
    log             TEXT NOT NULL DEFAULT '',
    result_payload  JSONB,
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ
);

-- 5. files
CREATE TABLE files (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_type    VARCHAR(50) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_user   ON documents(user_id);
CREATE INDEX idx_automations_user ON automations(user_id);
CREATE INDEX idx_runs_automation  ON automation_runs(automation_id);
CREATE INDEX idx_files_user       ON files(user_id);

-- Seed: admin user  (password = admin1234)
-- bcrypt hash for 'admin1234'
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@baikal.ai',
    '$2b$12$LJ3m4ys3Lk0TSwHjXwQKaeG8FX3wMYFl9IXvGz5eYh8FqKd5jLm6i',
    '관리자',
    'admin'
);
