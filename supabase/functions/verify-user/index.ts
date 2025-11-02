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
  if (req.method === 'OPTIONS') {
    // @ts-ignore
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      // @ts-ignore
      return new Response(
        JSON.stringify({ success: false, error: 'ID do utilizador é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Atualizar o status no perfil para 'verified'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'verified' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Confirmar o "e-mail" do utilizador na autenticação do Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (authError) throw authError;

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