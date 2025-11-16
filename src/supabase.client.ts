import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url) {
  console.error('[❌ Supabase Error] SUPABASE_URL is undefined');
}

if (!key) {
  console.error('[❌ Supabase Error] SUPABASE_KEY is undefined');
}

export const supabase = createClient(url as string, key as string);