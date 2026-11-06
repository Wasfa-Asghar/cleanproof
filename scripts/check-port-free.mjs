#!/usr/bin/env node
/**
 * Exit 0 if TCP port is free, 1 if in use (Playwright / E2E preflight).
 * Usage: node scripts/check-port-free.mjs 3099
 */
import net from "net";

const port = Number(process.argv[2] ?? "3099");
if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("Usage: node scripts/check-port-free.mjs <port>");
  process.exit(1);
}

const srv = net.createServer();
srv.once("error", (err) => {
  if (/** @type {NodeJS.ErrnoException} */ (err).code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other process (e.g. next dev) or use a free port.`);
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
srv.listen(port, () => {
  srv.close(() => process.exit(0));
});
