-- Create a new migration file
-- File name: 20250112_add_verification_code_column.sql

-- Add verification_code column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_code TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_code 
ON profiles(verification_code);

-- Add comment to document the column
COMMENT ON COLUMN profiles.verification_code IS 'Código de verificação de 6 dígitos enviado ao usuário durante o cadastro';