import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
