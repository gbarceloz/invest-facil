import { spawn, spawnSync } from "node:child_process";

const PORT = process.env.E2E_FRONTEND_PORT ?? "3100";
const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:18081";
const env = {
  ...process.env,
  API_PROXY_TARGET: API_URL,
  NEXT_TELEMETRY_DISABLED: "1",
};

if (process.env.E2E_SKIP_BUILD !== "1") {
  console.log("[e2e] building frontend with API_PROXY_TARGET=" + API_URL);
  const build = spawnSync("npm", ["run", "build"], {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const server = spawn("npm", ["run", "start", "--", "--port", PORT], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

server.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.kill(signal);
    process.exit(0);
  });
}
