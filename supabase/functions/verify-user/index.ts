// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
const supabaseAdmin = createClient(
  // @ts-ignore
  Deno.env.get('SUPABASE_URL') ?? '',
  // @ts-ignore
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// @ts-ignore
serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    // @ts-ignore
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, verificationCode } = await req.json();
    
    if (!userId || !verificationCode) {
      // @ts-ignore
      return new Response(
        JSON.stringify({ success: false, error: 'ID do utilizador e código de verificação são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // A lógica de verificação principal: o código deve ser igual ao ID do utilizador.
    if (userId !== verificationCode) {
      // @ts-ignore
      return new Response(
        JSON.stringify({ success: false, error: 'Código de verificação inválido.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Se o código estiver correto, prossiga com a ativação.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'verified' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // @ts-ignore
    return new Response(
      JSON.stringify({ success: true, message: 'Utilizador verificado com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Erro de Verificação:', error);
    // @ts-ignore
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});