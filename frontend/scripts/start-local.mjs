#!/usr/bin/env node
/**
 * Inicia o frontend Next.js em background para testes locais.
 *
 * Contrato:
 * - escolhe a porta (3000; se ocupada, 3001) ou usa --port/PORT;
 * - spawna `npx next dev -p <porta>` desacoplado (detached + stdio ignore + unref);
 * - grava PID, metadados e log em frontend/.local/ (nunca em public/);
 * - aguarda o HTML responder e sonda /api/v1/content/categories;
 * - encerra o script deixando o servidor vivo.
 *
 * Uso:
 *   node frontend/scripts/start-local.mjs
 *   node frontend/scripts/start-local.mjs --port 3001
 *
 * Encerrar (use o listeningPid impresso no JSON):
 *   Stop-Process -Id <pid>
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const localDir = path.join(frontendDir, ".local");
const logPath = path.join(localDir, "dev-server.log");
const pidPath = path.join(localDir, "dev-server.pid");
const metaPath = path.join(localDir, "dev-server.json");
const READY_TIMEOUT_MS = Number(process.env.READY_TIMEOUT_MS ?? 90_000);
const POLL_INTERVAL_MS = 750;

function log(line) {
  const entry = `[${new Date().toISOString()}] ${line}`;
  console.log(entry);
  try {
    appendFileSync(logPath, `${entry}\n`, "utf8");
  } catch {
    /* log é best-effort */
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

function parseRequestedPort() {
  const flagIndex = process.argv.indexOf("--port");
  const fromFlag = flagIndex >= 0 ? process.argv[flagIndex + 1] : undefined;
  const raw = fromFlag ?? process.env.PORT;
  if (raw === undefined || raw === "") return null;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Porta inválida: ${raw}`);
  }
  return port;
}

async function choosePort() {
  const requested = parseRequestedPort();
  if (requested !== null) {
    if (!(await isPortFree(requested))) {
      throw new Error(`Porta ${requested} já está em uso.`);
    }
    return requested;
  }
  if (await isPortFree(3000)) return 3000;
  if (await isPortFree(3001)) return 3001;
  throw new Error("Portas 3000 e 3001 estão ocupadas; informe --port.");
}

function buildSpawnCommand(port) {
  // No Windows o Node recusa spawnar npx.cmd sem shell (EINVAL, correção de
  // segurança). Passamos pelo cmd.exe mantendo `npx next dev`, e depois
  // descobrimos o PID real do listener para o Stop-Process.
  if (process.platform === "win32") {
    return {
      command: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/s", "/c", `npx next dev -p ${port}`],
    };
  }
  return { command: "npx", args: ["next", "dev", "-p", String(port)] };
}

function findListeningPid(port) {
  try {
    if (process.platform === "win32") {
      const output = execFileSync("netstat", ["-ano", "-p", "TCP"], {
        encoding: "utf8",
        windowsHide: true,
      });
      for (const line of output.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        const columns = line.trim().split(/\s+/);
        const localAddress = columns[1] ?? "";
        if (!localAddress.endsWith(`:${port}`)) continue;
        const pid = Number(columns[columns.length - 1]);
        if (Number.isInteger(pid) && pid > 0) return pid;
      }
      return null;
    }
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
    });
    const pid = Number(output.trim().split(/\r?\n/)[0]);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function isAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function summarizeHtml(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null;
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title, bodyStart: body.slice(0, 200) };
}

async function probe(url, timeoutMs = 20_000) {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    location: response.headers.get("location"),
    body: text,
  };
}

async function main() {
  mkdirSync(localDir, { recursive: true });

  const port = await choosePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const { command, args } = buildSpawnCommand(port);

  log(`start: porta=${port} comando="${command} ${args.join(" ")}" cwd=${frontendDir}`);

  const child = spawn(command, args, {
    cwd: frontendDir,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: { ...process.env, PORT: String(port), NODE_ENV: "development" },
  });
  child.unref();
  if (!child.pid) throw new Error("spawn não retornou PID");
  log(`spawn: wrapperPid=${child.pid}`);

  let rootProbe = null;
  let anyResponse = null;
  const startedAt = Date.now();
  let lastError = "sem tentativa";
  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    try {
      const candidate = await probe(`${baseUrl}/`);
      anyResponse = candidate;
      if (candidate.status < 400) {
        rootProbe = candidate;
        break;
      }
      lastError = `HTTP ${candidate.status}`;
    } catch (error) {
      lastError = error?.cause?.code ?? error?.message ?? String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  const elapsedMs = Date.now() - startedAt;
  const listeningPid = findListeningPid(port) ?? child.pid;
  writeFileSync(pidPath, `${listeningPid}\n`, "utf8");

  if (!rootProbe) {
    const detail = anyResponse ? `${lastError} (servidor responde, HTML inválido)` : lastError;
    log(`falha: HTML não respondeu em ${elapsedMs}ms (${detail})`);
    writeFileSync(
      metaPath,
      JSON.stringify(
        {
          status: "PARTIAL",
          url: baseUrl,
          port,
          wrapperPid: child.pid,
          listeningPid,
          startedAt: new Date(startedAt).toISOString(),
          elapsedMs,
          error: lastError,
          logPath,
          stopCommand: `Stop-Process -Id ${listeningPid}`,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(
      JSON.stringify({ status: "PARTIAL", url: baseUrl, port, pid: listeningPid, error: lastError, logPath }),
    );
    process.exitCode = 1;
    return;
  }

  const html = summarizeHtml(rootProbe.body);
  log(
    `html: HTTP ${rootProbe.status} em ${elapsedMs}ms title=${JSON.stringify(html.title)} body=${JSON.stringify(html.bodyStart.slice(0, 120))}`,
  );

  let apiProbe = null;
  try {
    apiProbe = await probe(`${baseUrl}/api/v1/content/categories`, 30_000);
    log(
      `api: HTTP ${apiProbe.status} content-type=${apiProbe.contentType ?? "-"} body=${JSON.stringify(apiProbe.body.slice(0, 200))}`,
    );
  } catch (error) {
    const reason = error?.cause?.code ?? error?.message ?? String(error);
    log(`api: erro de rede (${reason}) — backend provavelmente fora do ar`);
    apiProbe = { status: null, error: reason };
  }

  const meta = {
    status: "PASS",
    url: baseUrl,
    port,
    wrapperPid: child.pid,
    listeningPid,
    alive: isAlive(listeningPid),
    startedAt: new Date(startedAt).toISOString(),
    elapsedMs,
    html: { status: rootProbe.status, contentType: rootProbe.contentType, title: html.title },
    api: apiProbe
      ? { status: apiProbe.status, contentType: apiProbe.contentType ?? null, bodyStart: (apiProbe.body ?? "").slice(0, 300), error: apiProbe.error ?? null }
      : null,
    logPath,
    pidPath,
    stopCommand: `Stop-Process -Id ${listeningPid}`,
  };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
  log(`pronto: ${baseUrl} listeningPid=${listeningPid} wrapperPid=${child.pid}`);
  console.log(JSON.stringify(meta));
}

main().catch((error) => {
  log(`erro fatal: ${error?.message ?? error}`);
  console.error(JSON.stringify({ status: "BLOCKED", error: error?.message ?? String(error), logPath }));
  process.exitCode = 1;
});
