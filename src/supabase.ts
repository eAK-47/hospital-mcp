/**
 * Supabase Client Utility
 *
 * Initializes and exports a singleton Supabase client
 * using environment variables for configuration.
 */
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  SUPABASE_URL and/or SUPABASE_ANON_KEY are not set in environment. ' +
    'Database operations will fail until these are configured.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'placeholder-key',
  {
    realtime: {
      WebSocket: WebSocket
    }
  } as any
);
