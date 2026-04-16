const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleAPI } = require("./api.js");

const PORT = process.env.PORT || 4173;
const ROOT = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

http
  .createServer(async (request, response) => {
    // 先尝试 API，API 处理过返回 true
    const handled = await handleAPI(request, response);
    if (handled) return;

    let requestPath = request.url || "/";
    // 去除 query string
    requestPath = requestPath.split("?")[0];
    if (requestPath === "/" || requestPath === "/index.html") {
      requestPath = "/public/index.html";
    }

    try {
      requestPath = decodeURIComponent(requestPath);
    } catch {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Bad Request");
      return;
    }

    const filePath = path.join(ROOT, path.normalize(requestPath).replace(/^(\.\.[/\\])+/, ""));

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not Found");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
      });
      response.end(content);
    });
  })
  .listen(PORT, () => {
    console.log(`AI narrative game running at http://localhost:${PORT}`);
  });
