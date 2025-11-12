-- Cria a tabela para armazenar códigos de verificação temporários
CREATE TABLE user_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_code UNIQUE (user_id, code)
);

-- Cria um índice para buscas mais rápidas
CREATE INDEX idx_user_verification_codes_user_id ON user_verification_codes(user_id);
CREATE INDEX idx_user_verification_codes_expires_at ON user_verification_codes(expires_at);