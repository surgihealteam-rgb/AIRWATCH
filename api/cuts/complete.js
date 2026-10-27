import { db, json, method } from "../_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    const { campaign_id, filename, content_type, size_bytes, storage_path, name, seconds } = req.body || {};
    if (!campaign_id || !filename || !storage_path || !Number.isFinite(Number(size_bytes)))
      return json(res, 400, { error: "Upload details are incomplete." });
    if (!String(storage_path).startsWith(`${campaign_id}/`)) return json(res, 400, { error: "Invalid storage path." });
    const supabase = db();
    const { data: existing, error: checkError } = await supabase.from("cuts").select("id").eq("storage_path", storage_path).maybeSingle();
    if (checkError) throw checkError;
    if (existing) return json(res, 200, { ...existing, message: "This trailer cut is already saved." });
    const { data, error } = await supabase.from("cuts").insert({
      campaign_id, filename: String(filename).slice(0,255), storage_path,
      content_type: content_type || null, size_bytes: Number(size_bytes), status: "uploaded_not_analyzed",
      name: String(name || filename).slice(0,255), duration_seconds: Number(seconds) || 10
    }).select().single();
    if (error) throw error;
    return json(res, 201, { ...data, message: "Trailer uploaded and saved. Fingerprint extraction and live matching still require the separate worker." });
  } catch (e) { console.error(e); return json(res, 500, { error: e?.message || "Could not save uploaded cut details." }); }
}
