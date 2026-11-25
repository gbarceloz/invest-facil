import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, openSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..", "..");
const BACKEND = resolve(ROOT, "backend");
const RUNTIME = resolve(__dirname, "..", "test-results");
const DB_CONTAINER = "investfacil-e2e-db";
const DB_PORT = "55433";
const API_PORT = "18081";
const HEALTH_URL = `http://127.0.0.1:${API_PORT}/actuator/health`;

/**
 * Segredo JWT exclusivo da execução E2E.
 * - Usa E2E_JWT_SECRET quando definido.
 * - Caso contrário, gera um valor aleatório por execução.
 * O valor nunca é logado, persistido ou incluído em relatório.
 */
function resolveE2eJwtSecret(): string {
  const provided = process.env.E2E_JWT_SECRET?.trim();
  if (provided) return provided;
  return randomBytes(48).toString("base64");
}

const E2E_JWT_SECRET = resolveE2eJwtSecret();

function log(message: string) {
  console.log(`[e2e] ${message}`);
}

function run(command: string, args: string[], options: Record<string, unknown> = {}) {
  return spawnSync(command, args, { encoding: "utf8", ...options });
}

function sleep(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function resolveMaven(): string {
  if (process.env.E2E_MVN) return process.env.E2E_MVN;
  const onPath = run("mvn", ["-v"]);
  if (onPath.status === 0) return "mvn";
  throw new Error(
    "Maven não encontrado. Defina E2E_MVN ou coloque mvn no PATH para executar o E2E.",
  );
}

function resolveJavaHome(): string | undefined {
  return process.env.JAVA_HOME;
}

async function waitForDocker() {
  const version = run("docker", ["version", "--format", "{{.Server.Version}}"]);
  if (version.status !== 0) {
    throw new Error(
      "Docker não está disponível. O E2E exige Docker para PostgreSQL isolado (Testcontainers não é usado aqui).",
    );
  }
}

async function startDatabase() {
  run("docker", ["rm", "-f", DB_CONTAINER]);
  const started = run("docker", [
    "run",
    "-d",
    "--rm",
    "--name",
    DB_CONTAINER,
    "-e",
    "POSTGRES_PASSWORD=local",
    "-e",
    "POSTGRES_DB=investfacil",
    "-p",
    `${DB_PORT}:5432`,
    "postgres:17-alpine",
  ]);
  if (started.status !== 0) {
    throw new Error(`Falha ao iniciar PostgreSQL de teste: ${started.stderr || started.stdout}`);
  }

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const ready = run("docker", [
      "exec",
      DB_CONTAINER,
      "pg_isready",
      "-U",
      "postgres",
      "-d",
      "investfacil",
    ]);
    if (ready.status === 0) {
      log(`PostgreSQL pronto em localhost:${DB_PORT}`);
      return;
    }
    await sleep(1_000);
  }
  throw new Error("PostgreSQL de teste não ficou pronto em 60s.");
}

async function waitForBackend(child: ChildProcess, logFile: string) {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Backend encerrou durante a inicialização (exit ${child.exitCode}). Veja ${logFile}`);
    }
    try {
      const response = await fetch(HEALTH_URL);
      if (response.ok) {
        const body = (await response.json()) as { status?: string };
        if (body.status === "UP") {
          log(`Backend pronto em http://localhost:${API_PORT}`);
          return;
        }
      }
    } catch {
      // not ready yet
    }
    await sleep(1_000);
  }
  throw new Error(`Backend não ficou pronto em 180s. Veja ${logFile}`);
}

function startBackend(): ChildProcess {
  const maven = resolveMaven();
  const javaHome = resolveJavaHome();
  const logFile = resolve(RUNTIME, "e2e-backend.log");
  mkdirSync(RUNTIME, { recursive: true });
  const output = openSync(logFile, "a");

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PORT: API_PORT,
    SPRING_PROFILES_ACTIVE: "dev",
    SPRING_DATASOURCE_URL: `jdbc:postgresql://localhost:${DB_PORT}/investfacil`,
    SPRING_DATASOURCE_USERNAME: "postgres",
    SPRING_DATASOURCE_PASSWORD: "local",
    SPRING_FLYWAY_URL: `jdbc:postgresql://localhost:${DB_PORT}/investfacil`,
    SPRING_FLYWAY_USER: "postgres",
    SPRING_FLYWAY_PASSWORD: "local",
    JWT_SECRET: E2E_JWT_SECRET,
    EXPOSE_DEV_TOKENS: "true",
    COOKIE_SECURE: "false",
    RATE_LIMIT_ENABLED: "false",
    SEED_CONTENT: "true",
    MAIL_ENABLED: "false",
    MARKET_ENABLED: "false",
    BITCOIN_MARKET_ENABLED: "false",
    APP_DEMO_ENABLED: "false",
    CORS_ALLOWED_ORIGINS: "http://127.0.0.1:3100,http://localhost:3100",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.Path = `${resolve(javaHome, "bin")};${process.env.Path ?? process.env.PATH ?? ""}`;
  }

  log(`Iniciando backend: ${maven} spring-boot:run`);
  const isWindows = process.platform === "win32";
  const child = spawn(isWindows ? `"${maven}"` : maven, ["-B", "-q", "spring-boot:run"], {
    cwd: BACKEND,
    env,
    detached: !isWindows,
    stdio: ["ignore", output, output],
    windowsHide: true,
    shell: isWindows,
  });
  child.on("error", (error) => console.error("[e2e] backend spawn error", error));
  return child;
}

export default async function globalSetup() {
  await waitForDocker();
  await startDatabase();
  const child = startBackend();
  mkdirSync(RUNTIME, { recursive: true });
  writeFileSync(
    resolve(RUNTIME, "e2e-runtime.json"),
    JSON.stringify({ backendPid: child.pid, databaseContainer: DB_CONTAINER }, null, 2),
  );
  try {
    await waitForBackend(child, resolve(RUNTIME, "e2e-backend.log"));
  } catch (error) {
    if (child.pid) run("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    throw error;
  }
}
