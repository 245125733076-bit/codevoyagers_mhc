import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  mood_score: number;
  emoji: string;
  entry_date: string;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
};

export type MotivationalQuote = {
  id: string;
  quote: string;
  author: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  is_user: boolean;
  created_at: string;
};
