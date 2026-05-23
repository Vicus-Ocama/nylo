import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nbubqfuizfzfauojchss.supabase.co'
const supabaseAnonKey = 'sb_publishable_hR8d426zKcYAy12-N50Kvg_CUYznlV6'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)