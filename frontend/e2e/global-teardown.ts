import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const RUNTIME = resolve(__dirname, "..", "test-results", "e2e-runtime.json");

export default async function globalTeardown() {
  if (!existsSync(RUNTIME)) {
    console.log("[e2e] runtime state not found; nothing to stop");
    return;
  }
  const state = JSON.parse(readFileSync(RUNTIME, "utf8")) as {
    backendPid?: number;
    databaseContainer?: string;
  };

  if (state.backendPid) {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(state.backendPid), "/T", "/F"], {
        encoding: "utf8",
      });
    } else {
      try {
        process.kill(-state.backendPid, "SIGTERM");
      } catch {
        try {
          process.kill(state.backendPid, "SIGTERM");
        } catch {
          // already stopped
        }
      }
    }
    console.log(`[e2e] backend ${state.backendPid} encerrado`);
  }

  if (state.databaseContainer) {
    spawnSync("docker", ["rm", "-f", state.databaseContainer], { encoding: "utf8" });
    console.log(`[e2e] container ${state.databaseContainer} removido`);
  }
}
