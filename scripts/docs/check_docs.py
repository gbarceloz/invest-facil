#!/usr/bin/env python3
"""Lightweight documentation integrity check for the Invest Facil canonical set.

Purpose: validate only what documentation can prove:
- canonical files exist;
- relative Markdown links resolve;
- SOURCE_REGISTRY defines D01..D20 exactly once;
- architecture docs and feature maps exist, have required status fields and unique IDs;
- referenced repository paths exist;
- canonical docs contain no unresolved placeholder markers.

It does NOT prove code behavior, tests, deployment, approvals or permissions.
Standard library only; no network. Run from anywhere:

    python scripts/docs/check_docs.py
"""

from __future__ import annotations

import glob
import os
import re
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CANONICAL = [
    "README.md",
    "docs/engineering/SOURCE_OF_TRUTH.md",
    "docs/engineering/CONTEXT_INDEX.md",
    "docs/engineering/SOURCE_REGISTRY.md",
    "docs/engineering/P0_4_VERIFICATION.md",
    "docs/engineering/P1_1_VERIFICATION.md",
    "docs/engineering/P0_3_VERIFICATION.md",
    "docs/engineering/CI_POLICY.md",
    "docs/architecture/README.md",
    "docs/architecture/system-overview.md",
    "docs/architecture/frontend-map.md",
    "docs/architecture/backend-map.md",
    "docs/architecture/database-map.md",
    "docs/architecture/authentication-map.md",
    "docs/architecture/api-map.md",
    "docs/architecture/integration-map.md",
    "docs/architecture/dependency-map.md",
    "docs/architecture/critical-paths.md",
    "docs/architecture/features/README.md",
]

LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
DOMAIN_RE = re.compile(r"^\|\s*(D\d{2})\s*\|", re.MULTILINE)
FEATURE_ID_RE = re.compile(r"^feature_id:\s*(FEAT-[A-Z0-9-]+)\s*$", re.MULTILINE)
FEATURE_FIELD_RE = re.compile(r"^name:\s*(.+)$|^domain:\s*(\S+)$|^feature_id:\s*(\S+)$", re.MULTILINE)
STATUS_RE = re.compile(
    r"^\s{2}(discovery|implementation|test|verification|human_review|deployment|publication):\s*(.+?)\s*$",
    re.MULTILINE,
)
ALLOWED_STATUS = {
    "PLANNED", "DISCOVERED", "MAPPED", "IMPLEMENTED", "TESTED", "VERIFIED", "PARTIAL",
    "BLOCKED", "NOT VERIFIED", "HUMAN REVIEW REQUIRED", "HUMAN APPROVED",
    "READY FOR RELEASE", "DEPLOYED", "PUBLISHED", "DEPRECATED", "ARCHIVED",
    "NOT APPLICABLE", "NOT REQUIRED", "NOT DEPLOYED", "NOT PUBLISHED",
}
REQUIRED_STATUS = ("discovery", "implementation", "test", "verification", "human_review", "deployment", "publication")
REF_PREFIXES = (
    "frontend/", "backend/", "docs/", ".github/", "scripts/", "video/", "content/",
    "render.yaml", "docker-compose.yml", "README.md",
)
ENDPOINT_IN_TEXT_RE = re.compile(r"\b(GET|POST|PATCH|PUT|DELETE)\s+(/api/v1/[A-Za-z0-9_./{}-]+)")
MAPPING_RE = re.compile(r"@(Get|Post|Patch|Put|Delete)Mapping(?:\s*\(([^)]*)\))?")
PATH_ARG_RE = re.compile(r'(?:value\s*=\s*)?"([^"]*)"')


def fail(message: str) -> None:
    print(f"DOCS FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def check_links(path: str) -> int:
    checked = 0
    text = open(path, encoding="utf-8").read()
    in_code = False
    for line in text.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        for match in LINK_RE.finditer(line):
            target = match.group(1).strip()
            if target.startswith("<") and target.endswith(">"):
                target = target[1:-1]
            if any(x in target for x in ("://", "mailto:", "#", "{", "}", "C:\\", "C:/", "~")):
                continue
            target = target.split("#", 1)[0].strip()
            if not target:
                continue
            resolved = os.path.normpath(
                os.path.join(os.path.dirname(path), urllib.parse.unquote(target))
            )
            checked += 1
            if not os.path.exists(resolved):
                fail(f"broken link in {os.path.relpath(path, ROOT)}: {target}")
    return checked


def check_feature_map(path: str) -> str:
    rel = os.path.relpath(path, ROOT)
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---\n"):
        fail(f"feature map without frontmatter: {rel}")
    try:
        frontmatter = text.split("---", 2)[1]
    except IndexError:
        fail(f"unclosed frontmatter: {rel}")

    fid_match = re.search(r"^feature_id:\s*(FEAT-[A-Z0-9-]+)\s*$", frontmatter, re.MULTILINE)
    if not fid_match:
        fail(f"missing/invalid feature_id: {rel}")
    fid = fid_match.group(1)
    if not re.search(r"^name:\s*\S.+$", frontmatter, re.MULTILINE):
        fail(f"missing name: {rel}")
    if not re.search(r"^domain:\s*\S+$", frontmatter, re.MULTILINE):
        fail(f"missing domain: {rel}")

    statuses = {key: value for key, value in STATUS_RE.findall(frontmatter)}
    missing = [key for key in REQUIRED_STATUS if key not in statuses]
    if missing:
        fail(f"{rel}: missing status field(s): {', '.join(missing)}")
    for key, value in statuses.items():
        if value not in ALLOWED_STATUS:
            fail(f"{rel}: invalid status {key}={value}")

    for section in ("## Frontend", "## API", "## Backend", "## Database", "## Security", "## Tests"):
        if section not in text:
            fail(f"{rel}: missing section {section}")

    for ref in re.findall(r"`([^`\n]+)`", text):
        if not ref.startswith(REF_PREFIXES):
            continue
        if ref.startswith(("video/mp4", "video/webm", "video/quicktime")):
            continue
        if any(ch in ref for ch in "*?${}<>|"):
            continue
        if not os.path.exists(os.path.join(ROOT, ref)):
            fail(f"{rel}: referenced path does not exist: {ref}")

    for token in re.findall(r"`([A-Za-z0-9_]+Test(?:\.[A-Za-z0-9_]+)?)`", text):
        test_class = token.split(".", 1)[0]
        found = glob.glob(os.path.join(ROOT, "backend/src/test", "**", f"{test_class}.java"), recursive=True)
        if not found:
            fail(f"{rel}: referenced test class not found: {test_class}")
    return fid


def collect_controller_endpoints() -> set[tuple[str, str]]:
    endpoints: set[tuple[str, str]] = set()
    pattern = os.path.join(ROOT, "backend/src/main/java/**/*Controller.java")
    for path in glob.glob(pattern, recursive=True):
        text = open(path, encoding="utf-8").read()
        base_match = re.search(r'@RequestMapping\("([^"]+)"\)', text)
        base = base_match.group(1) if base_match else ""
        for match in MAPPING_RE.finditer(text):
            method = match.group(1).upper()
            args = match.group(2) or ""
            path_match = PATH_ARG_RE.search(args)
            suffix = path_match.group(1) if path_match else ""
            full = (base + suffix) if base else suffix
            full = "/" + full.strip("/") if full else "/"
            full = re.sub(r"/{2,}", "/", full)
            endpoints.add((method, full))
    return endpoints


def check_feature_endpoints(feature_files: list[str], endpoints: set[tuple[str, str]]) -> int:
    checked = 0
    for path in feature_files:
        rel = os.path.relpath(path, ROOT)
        text = open(path, encoding="utf-8").read()
        for method, endpoint in ENDPOINT_IN_TEXT_RE.findall(text):
            checked += 1
            if (method, endpoint) not in endpoints:
                fail(f"{rel}: endpoint not found in controllers: {method} {endpoint}")
    return checked


def main() -> None:
    missing = [p for p in CANONICAL if not os.path.isfile(os.path.join(ROOT, p))]
    if missing:
        fail(f"missing canonical file(s): {', '.join(missing)}")

    links = 0
    for rel in CANONICAL:
        links += check_links(os.path.join(ROOT, rel))

    feature_files = sorted(glob.glob(os.path.join(ROOT, "docs/architecture/features/FEAT-*.md")))
    if len(feature_files) < 15:
        fail(f"expected at least 15 feature maps, found {len(feature_files)}")
    feature_ids = [check_feature_map(path) for path in feature_files]
    if len(feature_ids) != len(set(feature_ids)):
        fail("duplicate feature_id in feature maps")
    for path in feature_files:
        links += check_links(path)

    endpoints = collect_controller_endpoints()
    if len(endpoints) < 40:
        fail(f"expected at least 40 controller endpoints, found {len(endpoints)}")
    endpoint_refs = check_feature_endpoints(feature_files, endpoints)

    registry = open(os.path.join(ROOT, "docs/engineering/SOURCE_REGISTRY.md"), encoding="utf-8").read()
    matrix = registry.split("## 1. Matriz", 1)[1].split("## 2.", 1)[0]
    ids = DOMAIN_RE.findall(matrix)
    expected = [f"D{i:02d}" for i in range(1, 21)]
    if sorted(ids) != expected:
        fail(f"SOURCE_REGISTRY domain IDs differ from D01..D20: {ids}")

    for rel in CANONICAL:
        text = open(os.path.join(ROOT, rel), encoding="utf-8").read()
        if re.search(r"\bTODO\b|\bTBD\b", text):
            fail(f"unresolved placeholder in {rel}")

    print(f"DOCS PASS: {len(CANONICAL)} canonical files, {len(feature_files)} feature maps, "
          f"{len(endpoints)} controller endpoints, {endpoint_refs} endpoint refs, "
          f"{links} relative links, D01..D20 unique")
    print("NOT PROVEN: code behavior, tests, deployment, approval, permissions.")


if __name__ == "__main__":
    main()
