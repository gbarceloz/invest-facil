"""Assert that the OpenAPI capture test ran and produced the current document."""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

REPORT = Path("backend/target/surefire-reports/TEST-com.investfacil.api.contract.OpenApiSnapshotIntegrationTest.xml")
SPEC = Path("backend/target/openapi-current.json")


def fail(message: str) -> None:
    print(f"OPENAPI CONTRACT GATE: FAIL - {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not REPORT.is_file():
        fail(f"missing surefire report: {REPORT}")
    try:
        root = ET.parse(REPORT).getroot()
    except ET.ParseError as exc:
        fail(f"invalid XML report {REPORT}: {exc}")
    suite = root if root.tag == "testsuite" else root.find("testsuite")
    if suite is None:
        fail(f"missing testsuite in {REPORT}")
    counts = {key: int(suite.attrib.get(key, "0")) for key in ("tests", "failures", "errors", "skipped")}
    if counts["tests"] < 1:
        fail(f"OpenApiSnapshotIntegrationTest ran {counts['tests']} tests")
    if counts["failures"] or counts["errors"] or counts["skipped"]:
        fail(f"OpenApiSnapshotIntegrationTest must run cleanly: {counts}")

    if not SPEC.is_file():
        fail(f"missing generated spec: {SPEC}")
    try:
        spec = json.loads(SPEC.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {SPEC}: {exc}")
    if not spec.get("paths"):
        fail(f"{SPEC} has no paths")

    print(f"OPENAPI CONTRACT GATE: PASS (test ran, {len(spec['paths'])} paths captured)")


if __name__ == "__main__":
    main()
