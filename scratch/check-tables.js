import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylsdljylqbnuajjyipwy.supabase.co';
const supabaseKey = 'sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('users:', { data, error });

  const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles:', { data: pData, error: pError });
}

check();
