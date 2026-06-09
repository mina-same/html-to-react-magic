import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "غير مصرح" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Extract caller's user ID from JWT (without re-verifying — Supabase already validated it)
  let callerId: string;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    callerId = payload.sub;
  } catch {
    return new Response(JSON.stringify({ error: "رمز المصادقة غير صالح" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Use service role to bypass RLS and check caller's role
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .single();

  if (profile?.role !== "association" && profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "ليس لديك صلاحية إضافة موظفين" }), {
      status: 403,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { email, password, name, role, status, assocId } = await req.json();

  if (!email || !password || !name || !assocId) {
    return new Response(
      JSON.stringify({ error: "الاسم والبريد والكلمة السرية ومعرف الجمعية مطلوبون" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  // Create the auth user
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "employee", name, assoc_id: assocId },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if (data.user) {
    // Set profile with employee role and assoc_id link
    await adminClient.from("profiles").upsert({
      id: data.user.id,
      role: "employee",
      assoc_id: assocId,
      assoc_name: null,
    });

    // Create the employees row linked to the auth user
    await adminClient.from("employees").insert({
      assoc_id: assocId,
      user_id: data.user.id,
      email,
      name,
      role: role ?? "",
      status: status ?? "active",
      color: "#7c3aed",
    });
  }

  return new Response(JSON.stringify({ id: data.user?.id }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
