/**
 * S3 / Storj / R2 Pre-signed URL Signer - Standard Netlify Function (Node.js runtime)
 * Fully compatible with AWS SDK v3 in Netlify Node.js functions.
 */

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

function getMimeType(filename, defaultMime) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeMap = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'm4a': 'audio/mp4',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'md': 'text/markdown'
  };
  return mimeMap[ext] || defaultMime || 'application/octet-stream';
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Mock-Access-Key, X-Mock-Secret-Key, X-Mock-Endpoint, X-Mock-Bucket",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const params = event.queryStringParameters || {};
  const headers = event.headers || {};
  const action = params.action;

  // Read credentials from headers (for mock testing) or environment variables
  const accessKeyId = headers["x-mock-access-key"] || process.env.STORJ_ACCESS_KEY_ID;
  const secretAccessKey = headers["x-mock-secret-key"] || process.env.STORJ_SECRET_ACCESS_KEY;
  const endpoint = headers["x-mock-endpoint"] || process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io";
  const bucket = headers["x-mock-bucket"] || process.env.STORJ_BUCKET;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        configured: false,
        reason: "Storage credentials or bucket are not configured in environment variables."
      })
    };
  }

  try {
    const s3 = new S3Client({
      endpoint,
      region: "us-east-1",
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true
    });

    if (action === "upload") {
      const name = params.name || "file";
      const type = params.type || "application/octet-stream";
      const randSuf = Math.random().toString(36).substring(2, 8);
      const key = `uploads/${randSuf}/${name}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: type
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ configured: true, uploadUrl, key, bucket, endpoint })
      };
    } else if (action === "download") {
      const key = params.key;
      const name = params.name || "download";
      const inline = params.inline === "true";

      if (!key) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Missing key parameter" })
        };
      }

      const decodedName = decodeURIComponent(name);
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: inline
          ? `inline; filename="${decodedName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(decodedName)}`
          : `attachment; filename="${decodedName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(decodedName)}`,
        ResponseContentType: getMimeType(decodedName, "application/octet-stream")
      });

      const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ configured: true, downloadUrl })
      };
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid action. Use 'upload' or 'download'." })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
