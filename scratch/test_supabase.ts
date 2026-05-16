import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setAdminPassword() {
  const emails = ["jonathancasales.c@gmail.com", "gustavo.2casales@gmail.com"];
  const password = "124578";

  for (const email of emails) {
    console.log(`\nAttempting to sign up ${email} with password ${password}...`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(`SignUp Error for ${email}:`, error.message);
      if (error.message.includes("already registered")) {
        console.log(`=> User ${email} already exists. We cannot force reset their password without the Service Role Key or their old password.`);
      }
    } else {
      console.log(`=> Successfully created account for ${email} with password ${password}`);
    }
  }
}

setAdminPassword();
