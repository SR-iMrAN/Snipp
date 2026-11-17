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

  const { to, link, title, type, expiresAt, message, originalUrl } = payload;

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
  }) : "Permanent (No Expiry)";

  const destinationLink = originalUrl || title || link;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(link)}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your SnipLink</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:36px 12px;">
        <tr>
          <td align="center">
            <!-- Main Card -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);overflow:hidden;">
              
              <!-- Header / Brand -->
              <tr>
                <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #f1f5f9;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                          🔗 SnipLink<span style="color:#10b981;">.</span>
                        </span>
                      </td>
                      <td align="right">
                        <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;background-color:#ecfdf5;color:#059669;padding:4px 10px;border-radius:12px;">
                          ${type ? type.toUpperCase() : 'SHARED LINK'}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding:28px 32px;">
                  <h1 style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#0f172a;">
                    Here is your shared ${type || 'link'}
                  </h1>
                  <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#475569;">
                    A link was generated and shared with you. You can open the short link below, view the original destination, or scan the QR code.
                  </p>

                  <!-- Short Link Box -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);border:1px solid #cbd5e1;border-radius:14px;margin-bottom:20px;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;margin-bottom:6px;">
                          Shortened Link
                        </div>
                        <div style="font-size:16px;font-weight:700;color:#047857;word-break:break-all;">
                          <a href="${link}" target="_blank" style="color:#059669;text-decoration:none;">
                            ${link}
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Main / Original Destination Link Box -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border:1px dashed #cbd5e1;border-radius:12px;margin-bottom:24px;">
                    <tr>
                      <td style="padding:14px 18px;">
                        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;margin-bottom:4px;">
                          Original Destination Link
                        </div>
                        <div style="font-size:13px;color:#334155;word-break:break-all;line-height:1.5;">
                          <a href="${destinationLink}" target="_blank" style="color:#3b82f6;text-decoration:underline;">
                            ${destinationLink}
                          </a>
                        </div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:6px;">
                          Status: ${expiryFormatted}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- QR Code Section -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:24px;text-align:center;">
                    <tr>
                      <td style="padding:24px 16px;">
                        <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
                          Scan QR Code with Mobile
                        </div>
                        <div style="display:inline-block;padding:10px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                          <img src="${qrCodeUrl}" alt="QR Code" width="160" height="160" style="display:block;width:160px;height:160px;border:0;margin:0 auto;"/>
                        </div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:8px;">
                          Points directly to your short link
                        </div>
                      </td>
                    </tr>
                  </table>

                  ${message ? `
                  <!-- Sender Note -->
                  <div style="font-size:13px;line-height:1.6;color:#475569;background:#fafafa;border-left:3px solid #10b981;padding:12px 14px;border-radius:4px;margin-bottom:24px;">
                    <strong style="color:#0f172a;">Note from sender:</strong><br/>
                    ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  </div>
                  ` : ''}

                  <!-- Action Button -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${link}" target="_blank" style="display:inline-block;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:9999px;box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                          Open Link &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer Note -->
              <tr>
                <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
                    Sent via <strong>SnipLink</strong> &bull; Fast, private 3-in-1 tool for short links, file sharing, and quick notes.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
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
