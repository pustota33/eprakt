import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      facilitators: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          city: string;
          tagline: string;
          description: string;
          rating: number;
          sessions: string[];
          format: string[];
          cost: string;
          photo: string;
          video_url: string;
          contacts: {
            telegram?: string;
            whatsapp?: string;
            email?: string;
          };
          reviews: Array<{
            id: string;
            name: string;
            text: string;
            photo: string;
          }>;
          schedule: Array<{
            id: string;
            city: string;
            date: string;
            location: string;
            time: string;
            cost: string;
          }>;
          title_prefix: string;
          cta_text: string;
          cta_href: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['facilitators']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['facilitators']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
