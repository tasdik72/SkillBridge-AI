import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';

/**
 * Deletes the currently authenticated user by calling a Supabase Edge Function.
 * IMPORTANT: You must deploy an Edge Function named `delete-user` that
 * deletes the user using the service role key.
 *
 * Example Edge Function (TypeScript - Deno):
 *
 * import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 * import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 *
 * serve(async (req) => {
 *   try {
 *     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
 *     const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 *     const client = createClient(supabaseUrl, serviceRoleKey);
 *     const { user } = await client.auth.getUser(); // edge functions don't have session; pass user id in body instead
 *
 *     const { user_id } = await req.json();
 *     if (!user_id) return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400 });
 *
 *     // Clean up related rows if needed (profiles, participants, etc.)
 *     // await client.from('profiles').delete().eq('id', user_id);
 *     const { error } = await client.auth.admin.deleteUser(user_id);
 *     if (error) throw error;
 *     return new Response(JSON.stringify({ ok: true }), { status: 200 });
 *   } catch (e) {
 *     return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
 *   }
 * });
 */
export async function deleteCurrentUser(userId: string) {
  // Call Edge Function
  const url = `${supabaseUrl}/functions/v1/delete-user`;

  try {
    // Use supabase.functions.invoke if available
    // @ts-ignore
    if (supabase.functions && typeof supabase.functions.invoke === 'function') {
      // @ts-ignore
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId },
      });
      if (error) throw error;
      return data;
    }

    // Otherwise, perform a raw fetch using the anon key (Edge Function will use service role)
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ user_id: userId })
    });
    if (!resp.ok) throw new Error(`Failed to delete account: ${resp.status}`);
    return await resp.json();
  } catch (err) {
    throw err;
  }
}
