import { db, json, method, fail } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["GET"])) return;
  try {
    const supabase = db();
    const [campaigns, cuts, channels, alerts] = await Promise.all([
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("cuts").select("*").order("created_at", { ascending: false }),
      supabase.from("channels").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").order("detected_at", { ascending: false }).limit(100)
    ]);
    for (const r of [campaigns, cuts, channels, alerts]) if (r.error) throw r.error;
    json(res, 200, { campaigns: campaigns.data, cuts: cuts.data, channels: channels.data, alerts: alerts.data,
      status: "Backend connected. Live monitoring requires a separate worker." });
  } catch (e) { fail(res, e); }
}