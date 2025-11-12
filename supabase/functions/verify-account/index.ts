import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, method, code, password } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID do usuário é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Cria cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Busca o perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Perfil não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verifica se já está verificado
    if (profile.status === 'verified') {
      return new Response(
        JSON.stringify({ success: false, error: 'Conta já está verificada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let success = false;
    let message = '';

    // Método 1: Verificação por código
    if (method === 'code') {
      // Verifica se o código expirou
      if (profile.verification_expires_at && new Date(profile.verification_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Código expirado. Solicite um novo.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Compara os códigos
      if (profile.verification_code === code) {
        success = true;
        message = 'Conta verificada com sucesso!';
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Código incorreto' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Método 2: Verificação por senha
    else if (method === 'password') {
      // Em produção, verificar a senha de forma segura
      if (password === 'conversio2024') {
        success = true;
        message = 'Conta verificada com sucesso!';
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Senha incorreta' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Método 3: Verificação por QR Code
    else if (method === 'qr') {
      // Verifica se o QR Code é válido
      if (profile.qr_code && profile.qr_expires_at && new Date(profile.qr_expires_at) > new Date()) {
        success = true;
        message = 'Conta verificada com sucesso!';
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'QR Code inválido ou expirado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Método 4: Verificação por link mágico
    else if (method === 'magic') {
      // Verifica se o link é válido
      if (profile.magic_link === code && profile.magic_expires_at && new Date(profile.magic_expires_at) > new Date()) {
        success = true;
        message = 'Conta verificada com sucesso!';
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Link inválido ou expirado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Se verificação bem-sucedida, atualiza o status
    if (success) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          // Limpa os campos temporários
          verification_code: null,
          verification_method: null,
          verification_expires_at: null,
          qr_code: null,
          qr_expires_at: null,
          magic_link: null,
          magic_expires_at: null
        })
        .eq('id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao atualizar status' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Método de verificação inválido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Erro na verificação:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});