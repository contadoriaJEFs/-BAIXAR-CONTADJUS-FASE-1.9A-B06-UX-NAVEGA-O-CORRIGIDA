// ============================================
// Supabase Client - Namespace CONTADJUS
// ============================================

// Cria o namespace se não existir
window.CONTADJUS = window.CONTADJUS || {};

// Credenciais (substitua pelas suas)
CONTADJUS.SUPABASE_URL = 'https://udxhriuvhfursglrozzy.supabase.co';
CONTADJUS.SUPABASE_ANON_KEY = 'sb_publishable_mYBJK_kS_KrCsyudRdR9dw_NAQwBHI9';

// Inicializa o cliente Supabase
CONTADJUS.supabase = supabase.createClient(
  CONTADJUS.SUPABASE_URL,
  CONTADJUS.SUPABASE_ANON_KEY
);
