import cors from "cors";
import express from "express";
import { accountRouter } from "./routes/account.js";
import { chatRouter } from "./routes/chat.js";
import { conversationsRouter } from "./routes/conversations.js";
import { projectsRouter } from "./routes/projects.js";
import { screensRouter } from "./routes/screens.js";
import { settingsRouter } from "./routes/settings.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "15mb" }));

app.use("/api/account", accountRouter);
app.use("/api/chat", chatRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/screens", screensRouter);
app.use("/api/settings", settingsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

const sockets = new Set<{ destroy: () => void }>();
server.on("connection", (socket) => {
  sockets.add(socket);
  socket.on("close", () => sockets.delete(socket));
});

let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  console.log(`[backend] Received ${signal}. Shutting down gracefully...`);

  const forceShutdownTimer = setTimeout(() => {
    sockets.forEach((socket) => {
      socket.destroy();
    });
  }, 3_000);
  forceShutdownTimer.unref();

  const forceExitTimer = setTimeout(() => {
    console.error("[backend] Forced shutdown after timeout");
    process.exit(1);
  }, 8_000);
  forceExitTimer.unref();

  server.close((error) => {
    clearTimeout(forceShutdownTimer);
    clearTimeout(forceExitTimer);

    if (error) {
      console.error("[backend] Error while closing server:", error);
      process.exit(1);
      return;
    }

    console.log("[backend] Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
