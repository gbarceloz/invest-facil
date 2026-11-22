#!/usr/bin/env node
/*
 * Lightweight frontend/backend contract compatibility check.
 *
 * - Verifies that every /api/v1 path called by frontend code exists in the
 *   versioned OpenAPI snapshot.
 * - Verifies that key hand-written DTO interfaces in frontend/lib/types.ts
 *   only use fields exposed by the corresponding OpenAPI schema, and that
 *   required schema fields are represented.
 * - Reports optionality warnings; fails on missing paths, schemas or fields.
 *
 * It does not replace generated clients or prove runtime behavior.
 * Uses the TypeScript compiler already installed in frontend/node_modules.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SNAPSHOT = path.join(ROOT, "docs", "contracts", "openapi.json");
const TYPES = path.join(ROOT, "frontend", "lib", "types.ts");
const TS = path.join(ROOT, "frontend", "node_modules", "typescript");

let ts;
try {
  ts = require(TS);
} catch {
  console.error("CONTRACT FAIL: frontend/node_modules/typescript is required");
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
const schemas = (spec.components && spec.components.schemas) || {};
const apiPaths = new Set(Object.keys(spec.paths || {}).map((p) => p.replace(/\{[^}]+\}/g, "{}")));

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
}

const sourceFiles = [];
walk(path.join(ROOT, "frontend", "app"), sourceFiles);
walk(path.join(ROOT, "frontend", "components"), sourceFiles);
walk(path.join(ROOT, "frontend", "lib"), sourceFiles);

const missingPaths = new Set();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const calls = text.match(/\/api\/v1\/[A-Za-z0-9_/${}.\-]+/g) || [];
  for (const call of calls) {
    const normalized = call
      .replace(/\$\{[^}]+\}/g, "{}")
      .replace(/\{[^}]+\}/g, "{}")
      .replace(/[?#].*$/, "");
    if (!apiPaths.has(normalized)) missingPaths.add(`${path.relative(ROOT, file)}: ${normalized}`);
  }
}

const mapping = {
  User: "UserView",
  ModuleSummary: "ModuleSummary",
  Category: "CategoryView",
  LessonSummary: "LessonSummary",
  ModuleDetail: "ModuleDetail",
  ArticleSummary: "ArticleSummary",
  ArticleDetail: "ArticleDetail",
  LessonDetail: "LessonDetail",
  VideoInfo: "VideoView",
  QuizQuestion: "QuizQuestionView",
  Quiz: "QuizView",
  QuizQuestionResult: "QuestionResult",
  QuizResult: "QuizResult",
  Level: "LevelView",
  Achievement: "AchievementView",
  GamificationSummary: "GamificationSummary",
  XpEntry: "XpEntry",
  CategoryProgress: "CategoryProgress",
  RecentActivity: "RecentActivity",
  NextLesson: "NextLesson",
  ProgressSummary: "ProgressSummary",
  LessonStatus: "LessonStatus",
  CompleteLessonResponse: "CompleteLessonResponse",
  MarketAsset: "AssetView",
  MarketResponse: "MarketResponse",
  BitcoinPoint: "Point",
  BitcoinMarketResponse: "BitcoinMarketResponse",
  ScenarioInput: "ScenarioRequest",
  ScenarioPoint: "ScenarioPoint",
  ScenarioResult: "ScenarioResult",
  SavedScenario: "SavedScenario",
  SessionInfo: "SessionView",
  LoginResponse: "AuthResponse",
  RegisterResponse: "RegisterResponse",
  SearchResults: "SearchResults",
};

const source = ts.createSourceFile(TYPES, fs.readFileSync(TYPES, "utf8"), ts.ScriptTarget.Latest, true);
const interfaces = new Map();
for (const node of source.statements) {
  if (!ts.isInterfaceDeclaration(node)) continue;
  const fields = [];
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    fields.push({
      name: member.name.getText(source),
      optional: Boolean(member.questionToken),
      type: member.type ? member.type.getText(source) : "unknown",
    });
  }
  interfaces.set(node.name.text, fields);
}

const failures = [];
const warnings = [];
for (const [frontendType, schemaName] of Object.entries(mapping)) {
  const schema = schemas[schemaName];
  if (!schema) {
    failures.push(`missing OpenAPI schema ${schemaName} for frontend ${frontendType}`);
    continue;
  }
  const fields = interfaces.get(frontendType);
  if (!fields) {
    failures.push(`missing frontend interface ${frontendType}`);
    continue;
  }
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);
  for (const field of fields) {
    if (!(field.name in properties)) {
      failures.push(`${frontendType}.${field.name} is not in OpenAPI ${schemaName}`);
    }
  }
  for (const name of required) {
    const field = fields.find((f) => f.name === name);
    if (!field) failures.push(`${frontendType} is missing required ${schemaName}.${name}`);
    else if (field.optional) warnings.push(`${frontendType}.${name} is optional but schema requires it`);
  }
}

if (missingPaths.size) {
  console.error("FRONTEND CONTRACT FAIL: paths not in OpenAPI snapshot");
  for (const item of [...missingPaths].sort()) console.error("  " + item);
  process.exit(1);
}
if (failures.length) {
  console.error("FRONTEND CONTRACT FAIL:");
  for (const item of failures) console.error("  " + item);
  process.exit(1);
}
for (const warning of warnings) console.log("WARN:", warning);
console.log(`FRONTEND CONTRACT PASS: ${apiPaths.size} API paths, ${Object.keys(mapping).length} mapped DTOs`);
console.log("NOT PROVEN: runtime serialization, nullability semantics, generated client correctness.");
