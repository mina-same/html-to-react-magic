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

  // Extract caller ID from JWT, use service role to bypass RLS
  let callerId: string;
  try {
    const token = authHeader.replace("Bearer ", "");
    callerId = JSON.parse(atob(token.split(".")[1])).sub;
  } catch {
    return new Response(JSON.stringify({ error: "رمز المصادقة غير صالح" }), {
      status: 401, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", callerId).single();

  if (profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "ليس لديك صلاحية الإنشاء" }), {
      status: 403,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { email, password, assocName, license, region, phone, status } = await req.json();

  if (!email || !password || !assocName) {
    return new Response(JSON.stringify({ error: "البريد والكلمة السرية واسم الجمعية مطلوبون" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "association", assoc_name: assocName },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Seed the associations record with the provided details
  if (data.user) {
    await adminClient.from("associations").upsert({
      id: data.user.id,
      license: license ?? "",
      region: region ?? "",
      phone: phone ?? "",
      email: email,
      description: "",
      status: status ?? "new",
      verified: false,
      updated_at: new Date().toISOString(),
    });
  }

  return new Response(JSON.stringify({ id: data.user?.id }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
