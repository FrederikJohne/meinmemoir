import { createServer } from "http";

const PORT = process.env.PORT || 3002;

const server = createServer((req, res) => {
  if (req.url === "/health" || req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "scheduler",
        timestamp: new Date().toISOString(),
      })
    );
  } else if (req.url === "/dispatch" && req.method === "POST") {
    import("./dispatch-prompts.js")
      .then(({ dispatchWeeklyPrompts }) => dispatchWeeklyPrompts())
      .then(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      })
      .catch((err) => {
        console.error("[Scheduler] Dispatch error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      });
  } else if (req.url === "/cleanup" && req.method === "POST") {
    import("./cleanup-audio.js")
      .then(({ cleanupExpiredAudio }) => cleanupExpiredAudio())
      .then(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      })
      .catch((err) => {
        console.error("[Scheduler] Cleanup error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[Scheduler] Server running on port ${PORT}`);
  console.log("[Scheduler] Endpoints:");
  console.log("  GET  /health  - Health check");
  console.log("  POST /dispatch - Trigger weekly prompt dispatch");
  console.log("  POST /cleanup  - Trigger expired audio cleanup");
});
