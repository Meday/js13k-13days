import { serve } from "bun";
import { join } from "path";

serve({
  fetch(req) {
    const url = new URL(req.url);
    let filePath = join("dist", url.pathname);

    // Default to index.html if the path is a directory or root
    if (url.pathname === "/" || url.pathname.endsWith("/")) {
      filePath = join(filePath, "index.html");
    }

    try {
      return new Response(Bun.file(filePath));
    } catch (e) {
      return new Response("File not found", { status: 404 });
    }
  },
  port: 3000,
});

console.log("Server running on http://localhost:3000");
