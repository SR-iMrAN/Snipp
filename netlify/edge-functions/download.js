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

export default async (request) => {
  const url = new URL(request.url);
  const fileUrl = url.searchParams.get("url");
  const fileName = url.searchParams.get("name") || "download";
  const inline = url.searchParams.get("inline") === "true";

  if (!fileUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return new Response(`Failed to fetch file: ${res.statusText}`, { status: res.status });
    }

    const decodedName = decodeURIComponent(fileName);
    const headers = new Headers();
    
    // Detect MIME type based on filename extension
    const mimeType = getMimeType(decodedName, res.headers.get("Content-Type"));
    headers.set("Content-Type", mimeType);
    headers.set("Access-Control-Allow-Origin", "*");

    if (inline) {
      headers.set("Content-Disposition", `inline; filename="${decodedName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(decodedName)}`);
    } else {
      headers.set("Content-Disposition", `attachment; filename="${decodedName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(decodedName)}`);
    }

    // Stream the body directly to bypass size limits (Deno/Deno Deploy compatible)
    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
