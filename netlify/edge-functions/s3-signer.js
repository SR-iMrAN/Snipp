/**
 * Forwarder: Routes /api/get-presigned-url to the standard Netlify Function (Node.js runtime).
 * This eliminates the AWS SDK bundling issue in the Deno Edge runtime.
 */

export default async (request, context) => {
  const url = new URL(request.url);
  const targetUrl = new URL(`/.netlify/functions/s3-signer${url.search}`, request.url);
  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined
  });
};
