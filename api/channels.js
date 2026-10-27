import { db, json, method, fail } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    const body = req.body || {};
    const campaign_id = String(body.campaign_id || "").trim();
    const url = String(body.url || body.channel_url || "").trim();
    const label = String(body.label || body.name || "Live channel").trim();
    if (!campaign_id || !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url))
      return json(res, 400, { error: "Select a campaign and enter a valid YouTube URL." });
    const supabase = db();
    const { data, error } = await supabase.from("channels")
      .insert({ campaign_id, url, label, status: "pending_authorization_check" }).select().single();
    if (error) throw error;
    json(res, 201, { ...data, message: "Channel saved. This does not yet start live monitoring; connect the worker after confirming permitted stream access." });
  } catch (e) { fail(res, e); }
}