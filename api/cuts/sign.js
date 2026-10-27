import { db, json, method } from "../_lib.js";
import path from "node:path";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    const { campaign_id, filename, content_type, size_bytes } = req.body || {};
    if (!campaign_id || !filename || !Number.isFinite(Number(size_bytes)) || Number(size_bytes) <= 0)
      return json(res, 400, { error: "Campaign, filename, and a non-empty file are required." });
    if (Number(size_bytes) > 100 * 1024 * 1024)
      return json(res, 413, { error: "Please keep each reference cut under 100 MB." });
    const supabase = db();
    const { data: campaign, error: campaignError } = await supabase.from("campaigns").select("id").eq("id", campaign_id).maybeSingle();
    if (campaignError) throw campaignError;
    if (!campaign) return json(res, 404, { error: "Campaign not found. Refresh and select it again." });
    const safe = path.basename(String(filename)).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storage_path = `${campaign_id}/${Date.now()}-${safe}`;
    const { data, error } = await supabase.storage.from("trailer-cuts").createSignedUploadUrl(storage_path);
    if (error) throw error;
    return json(res, 200, { signedUrl: data.signedUrl, token: data.token, storage_path });
  } catch (e) { console.error(e); return json(res, 500, { error: e?.message || "Could not prepare direct upload." }); }
}
