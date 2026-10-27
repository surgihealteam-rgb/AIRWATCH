import formidable from "formidable";
import fs from "node:fs/promises";
import path from "node:path";
import { db, json, method, fail, formValue } from "./_lib.js";
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  let tempPath;
  try {
    const form = formidable({ maxFileSize: 100 * 1024 * 1024, multiples: false });
    const [fields, files] = await form.parse(req);
    const campaign_id = String(formValue(fields, "campaign_id") || "");
    const file = formValue(files, "file") || formValue(files, "cut") || Object.values(files)[0]?.[0];
    if (!campaign_id || !file) return json(res, 400, { error: "Choose a campaign and upload a trailer file." });
    tempPath = file.filepath;
    const original = path.basename(file.originalFilename || "trailer.bin").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${campaign_id}/${Date.now()}-${original}`;
    const supabase = db();
    const bytes = await fs.readFile(file.filepath);
    const { error: uploadError } = await supabase.storage.from("trailer-cuts")
      .upload(storagePath, bytes, { contentType: file.mimetype || "application/octet-stream", upsert: false });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase.from("cuts").insert({
      campaign_id, filename: original, storage_path: storagePath,
      content_type: file.mimetype || null, size_bytes: file.size, status: "uploaded_not_analyzed"
    }).select().single();
    if (error) throw error;
    json(res, 201, { ...data, message: "Trailer uploaded. Fingerprint extraction and live matching require the separate worker." });
  } catch (e) {
    const msg = e?.httpCode === 413 ? "File is too large for this upload endpoint. Use a direct-to-storage upload for large files." : e?.message || "Upload failed";
    console.error(e); json(res, 500, { error: msg });
  } finally {
    if (tempPath) await fs.unlink(tempPath).catch(() => {});
  }
}