import { supabase } from "@/lib/supabase";

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface Commission {
  id: string;
  referrer_id: string;
  referred_id: string;
  amount_cents: number;
  status: 'pending' | 'available' | 'withdrawn' | 'cancelled';
  created_at: string;
  available_at: string;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  amount_cents: number;
  pix_key: string;
  pix_type: string;
  status: 'requested' | 'paid' | 'rejected';
  receipt_url: string | null;
  created_at: string;
}

export async function getReferralCode(userId: string) {
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as ReferralCode | null;
}

export async function createReferralCode(userId: string, code: string) {
  const { data, error } = await supabase
    .from('referral_codes')
    .insert([{ user_id: userId, code }])
    .select()
    .single();

  if (error) throw error;
  return data as ReferralCode;
}

export async function getCommissions(userId: string) {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Atualizar status de comissões que já passaram da carência de 7 dias
  const now = new Date();
  const commissionsToUpdate = (data as Commission[]).filter(c => 
    c.status === 'pending' && new Date(c.available_at) <= now
  );

  if (commissionsToUpdate.length > 0) {
    const ids = commissionsToUpdate.map(c => c.id);
    
    // Dispara a atualização silenciosamente no banco
    supabase.from('commissions').update({ status: 'available' }).in('id', ids).then(({ error }) => {
      if (error) console.error("Erro ao atualizar status de comissões", error);
    });
    
    // Atualiza localmente para refletir imediatamente na UI
    commissionsToUpdate.forEach(c => c.status = 'available');
  }

  return data as Commission[];
}

export async function getPayoutRequests(userId: string) {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PayoutRequest[];
}

export async function requestPayout(userId: string, amount_cents: number, pix_key: string, pix_type: string) {
  const { data, error } = await supabase
    .from('payout_requests')
    .insert([{ user_id: userId, amount_cents, pix_key, pix_type, status: 'requested' }])
    .select()
    .single();

  if (error) throw error;
  return data as PayoutRequest;
}

export async function checkReferralCodeValidity(code: string) {
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', code)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data as ReferralCode | null;
}

// ADMIN FUNCTIONS

export async function getAdminPayoutRequests() {
  const { data, error } = await supabase.rpc('get_admin_payout_requests');
  if (error) throw error;
  return data;
}

export async function getAdminCommissions() {
  const { data, error } = await supabase.rpc('get_admin_commissions');
  if (error) throw error;
  return data;
}

export async function markPayoutAsPaid(payoutId: string, receiptUrl: string) {
  const { data, error } = await supabase
    .from('payout_requests')
    .update({ 
      status: 'paid', 
      receipt_url: receiptUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  
  await supabase.rpc('mark_commissions_as_withdrawn', { 
    p_user_id: data.user_id, 
    p_amount_cents: data.amount_cents 
  });

  return data;
}

export async function getAdminPartners() {
  const { data, error } = await supabase.rpc('get_partners_by_admin');
  if (error) throw error;
  return data;
}

export async function removePartner(userId: string) {
  const { error } = await supabase.rpc('remove_partner', { p_target_user_id: userId });
  if (error) throw error;
}
