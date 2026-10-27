import { createClient } from "@supabase/supabase-js";

export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Backend is not configured: add Supabase environment variables in Vercel.");
  return createClient(url, key, { auth: { persistSession: false } });
}
export function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(data));
}
export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader("Allow", allowed.join(", "));
    json(res, 405, { error: "Method not allowed" });
    return false;
  }
  return true;
}
export function fail(res, error) {
  console.error(error);
  const msg = error?.message || "Unexpected backend error";
  json(res, 500, { error: msg });
}
export function formValue(form, key) {
  const v = form?.[key];
  return Array.isArray(v) ? v[0] : v;
}
