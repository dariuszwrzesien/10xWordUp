import { createClient } from "@supabase/supabase-js";

import type { Database } from "../types/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "77389cbc-49de-4e44-8a49-8952159501e4";
