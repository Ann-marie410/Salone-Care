-- Add blocked column to conversations for doctor blocking
ALTER TABLE conversations
  ADD COLUMN blocked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_conversations_blocked ON conversations (blocked);
