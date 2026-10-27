import formidable from "formidable";
import { db, json, method, fail, formValue } from "./_lib.js";
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (!method(req, res, ["GET", "POST"])) return;
  try {
    const supabase = db();
    if (req.method === "GET") {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json(res, 200, data);
    }

    let title = "";
    let alert_email = "";
    const contentType = String(req.headers["content-type"] || "").toLowerCase();
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = formidable({ maxFileSize: 1024 * 1024, maxFields: 20 });
      const [fields] = await form.parse(req);
      title = String(formValue(fields, "title") || "").trim();
      alert_email = String(formValue(fields, "alert_email") || "").trim();
    } else {
      const body = req.body || {};
      title = String(body.title || "").trim();
      alert_email = String(body.alert_email || "").trim();
    }

    if (!title || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alert_email)) {
      return json(res, 400, { error: "Enter a campaign title and valid alert email." });
    }
    const { data, error } = await supabase.from("campaigns")
      .insert({ title, alert_email, status: "setup" }).select().single();
    if (error) throw error;
    return json(res, 201, { ...data, message: "Campaign created successfully." });
  } catch (e) {
    fail(res, e);
  }
}
