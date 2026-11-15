/**
 * Share via Email - Serverless Function
 * Sends link details to recipient using Resend email API.
 */

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed. Use POST." })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON payload." })
    };
  }

  const { to, link, title, type, expiresAt, message } = payload;

  if (!to || !to.includes("@")) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "A valid recipient email address is required." })
    };
  }

  if (!link) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Link parameter is missing." })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL || "SnipLink <onboarding@resend.dev>";

  const expiryFormatted = expiresAt ? new Date(expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }) : "30 days";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8fafc;color:#0f172a;margin:0;padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:20px;display:flex;align-items:center;">
          SNIPLINK<span style="color:#10b981;">.</span>
        </div>
        <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:16px;">
          Someone has shared a <strong>${type || 'link'}</strong> with you via SnipLink:
        </p>
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:16px;margin-bottom:20px;">
          <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px;word-break:break-all;">
            ${title || 'Shared Content'}
          </div>
          <div style="font-size:12px;color:#64748b;margin-bottom:12px;">
            Expires: <strong>${expiryFormatted}</strong>
          </div>
          <a href="${link}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;padding:10px 18px;border-radius:8px;">
            Open ${type || 'Link'} &rarr;
          </a>
        </div>
        ${message ? `
          <div style="font-size:13px;line-height:1.6;color:#475569;background:#fafafa;border-left:3px solid #10b981;padding:12px 14px;border-radius:4px;margin-bottom:20px;">
            <strong>Note from sender:</strong><br/>
            ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        ` : ''}
        <div style="font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;text-align:center;">
          Generated with SnipLink &mdash; Privacy-first temporary link sharing.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    // If API key is not configured, report clearly
    console.warn("RESEND_API_KEY is not configured in environment variables.");
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        simulated: true,
        message: "Email simulated: RESEND_API_KEY is not configured on the server. Add RESEND_API_KEY in your Netlify dashboard environment variables to enable live delivery."
      })
    };
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [to],
        subject: `SnipLink: ${title || 'Shared Content'}`,
        html: emailHtml
      })
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return {
        statusCode: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: resendData.message || "Failed to send email via Resend." })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, id: resendData.id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal server error sending email." })
    };
  }
};
