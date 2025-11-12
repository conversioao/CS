// @ts-nocheck
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
    const { userId, code } = await req.json();
    
    if (!userId || !code) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID do usuário e código são obrigatórios.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('verification_code, status')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error('Perfil de usuário não encontrado.');
    if (profile.status === 'verified') {
      return new Response(
        JSON.stringify({ success: true, message: 'Conta já está verificada.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (profile.verification_code === code) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          verification_code: null, // Limpa o código após o uso
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'Conta verificada com sucesso!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Código de verificação inválido.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

  } catch (error) {
    console.error('Erro na verificação:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno do servidor.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});