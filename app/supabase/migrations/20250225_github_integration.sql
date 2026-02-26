-- Migração: Integração GitHub (repositórios + issues)
-- Execute no SQL Editor do Supabase

-- Colunas para integração GitHub em user_settings
ALTER TABLE user_settings 
  ADD COLUMN IF NOT EXISTS github_access_token TEXT,
  ADD COLUMN IF NOT EXISTS selected_repo JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linked_issue_id INTEGER;

-- selected_repo: { owner, repo, full_name }
-- linked_issue_id: número da issue no repositório
