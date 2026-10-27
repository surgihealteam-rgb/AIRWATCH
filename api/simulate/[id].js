import { db, json, method, fail } from "../_lib.js";
import { Resend } from "resend";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    const id = String(req.query.id || "");
    const supabase = db();
    const { data: campaign, error: campaignError } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (campaignError) throw campaignError;
    const { data: alert, error } = await supabase.from("alerts").insert({
      campaign_id: id, status: "DEMO_ONLY", confidence: null,
      evidence: "Simulated test alert — no live stream match was performed."
    }).select().single();
    if (error) throw error;
    let emailStatus = "not_configured";
    if (process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const sent = await resend.emails.send({
        from: process.env.ALERT_FROM_EMAIL, to: campaign.alert_email,
        subject: "[AirWatch TEST] Demo alert",
        text: `This is a DEMO alert for "${campaign.title}". No real trailer match or live-TV detection occurred.`
      });
      if (sent.error) throw new Error(sent.error.message);
      emailStatus = "sent";
    }
    json(res, 200, { ...alert, message: `Demo alert recorded; email status: ${emailStatus}. This is not a real detection.` });
  } catch (e) { fail(res, e); }
}