/**
 * GoFile Download Resolver - Serverless Function
 * Safely resolves direct downloads using GoFile API token if available,
 * or routes to verified storage page on free tiers.
 */

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const params = event.queryStringParameters || {};
  const contentId = params.id;
  const fileName = params.name || "download";
  const downloadPage = params.page || "";
  const serverToken = process.env.GOFILE_API_TOKEN;

  if (!contentId && !downloadPage) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing file id or download page parameter" })
    };
  }

  // If a server-side GoFile API token is configured, request a direct link
  if (serverToken && contentId) {
    try {
      const directLinkRes = await fetch(`https://api.gofile.io/contents/${contentId}/directlinks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serverToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expireTime: Math.floor(Date.now() / 1000) + 3600 // 1 hour token
        })
      });

      const result = await directLinkRes.json();
      if (result.status === "ok" && result.data && result.data.directLink) {
        return {
          statusCode: 302,
          headers: {
            ...corsHeaders,
            "Location": result.data.directLink,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`
          },
          body: ""
        };
      }
    } catch (err) {
      console.error("GoFile directlink API error:", err);
    }
  }

  // If no server token or directlinks not supported on free tier, route safely to downloadPage
  if (downloadPage) {
    return {
      statusCode: 302,
      headers: {
        ...corsHeaders,
        "Location": downloadPage
      },
      body: ""
    };
  }

  return {
    statusCode: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Download link could not be resolved" })
  };
};
