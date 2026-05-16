import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ylsdljylqbnuajjyipwy.supabase.co',
  'sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry'
);

async function testGet() {
  console.log("Testing GET products...");
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
  } catch (e) {
    console.error("Exception:", e);
  }
}

testGet();
