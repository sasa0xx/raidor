import { createClient } from "@supabase/supabase-js";

let url = import.meta.env.VITE_SUPABASE_URL
let key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(url, key)
