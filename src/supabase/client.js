// src/supabase/client.js
import { supabase } from '@/supabase/supabaseClient';

const supabaseUrl = 'https://uqbcqbkuemyjrncclyjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxYmNxYmt1ZW15anJuY2NseWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjU3MjgsImV4cCI6MjA2NjA0MTcyOH0.5oreu-KtgnxUKizwuvjiQo0lDGN9JAX824PgfGLPB8U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
