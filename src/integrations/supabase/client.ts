
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ncjbvdbkulnekwsjzicq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ2ZGJrdWxuZWt3c2p6aWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzM1NzIsImV4cCI6MjA2Mzk0OTU3Mn0.UmidmP9m5Z2Rk8eurCVDq8u7Hxem9_bnlhddkuOVbYg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
