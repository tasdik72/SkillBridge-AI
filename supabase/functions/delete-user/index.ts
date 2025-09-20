/**
 * @fileoverview Supabase Edge Function for deleting users
 * This file runs in Deno runtime, not Node.js
 */

// Deno global declaration for TypeScript
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

// @ts-ignore - Deno runtime import
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Optional: clean up dependent rows first to avoid foreign key conflicts
    // await admin.from('conversation_participants').delete().eq('user_id', user_id);
    // await admin.from('mentorship_requests').delete().or(`learner_id.eq.${user_id},mentor_id.eq.${user_id}`);
    // await admin.from('profiles').delete().eq('id', user_id);

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
