import { db, json, method, fail } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["GET", "POST"])) return;
  try {
    const supabase = db();
    if (req.method === "GET") {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json(res, 200, data);
    }
    const body = req.body || {};
    const title = String(body.title || "").trim();
    const alert_email = String(body.alert_email || "").trim();
    if (!title || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alert_email))
      return json(res, 400, { error: "Enter a campaign title and valid alert email." });
    const { data, error } = await supabase.from("campaigns")
      .insert({ title, alert_email, status: "setup" }).select().single();
    if (error) throw error;
    json(res, 201, { ...data, message: "Campaign created. Add trailer cuts and authorized channels next." });
  } catch (e) { fail(res, e); }
}