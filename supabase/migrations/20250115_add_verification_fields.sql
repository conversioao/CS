-- Adiciona campos para verificação em múltiplos métodos
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_method TEXT,
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS magic_link TEXT,
ADD COLUMN IF NOT EXISTS magic_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS security_questions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS backup_codes TEXT[] DEFAULT '{}';

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_expires ON profiles(verification_expires_at) WHERE verification_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_qr_expires ON profiles(qr_expires_at) WHERE qr_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_magic_expires ON profiles(magic_expires_at) WHERE magic_expires_at IS NOT NULL;

-- Atualiza perfis existentes para terem os campos padrão
UPDATE profiles 
SET verification_method = 'whatsapp',
    verification_expires_at = NOW() + INTERVAL '24 hours',
    two_factor_enabled = false,
    security_questions = '[]'::jsonb,
    backup_codes = '{}'
WHERE status = 'pending' AND verification_method IS NULL;

-- Adiciona constraint para garantir que apenas um método de verificação ativo exista
ALTER TABLE profiles 
ADD CONSTRAINT chk_active_verification_method 
CHECK (
  (verification_method IS NULL AND verification_code IS NULL AND verification_expires_at IS NULL) OR
  (qr_code IS NULL AND qr_expires_at IS NULL) OR
  (magic_link IS NULL AND magic_expires_at IS NULL)
);