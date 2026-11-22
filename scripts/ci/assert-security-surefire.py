"""Assert that the three Ownership/Admin security suites really ran."""

from __future__ import annotations

import glob
import sys
import xml.etree.ElementTree as ET

REQUIRED = {
    "com.investfacil.api.security.OwnershipSecurityIntegrationTest": 7,
    "com.investfacil.api.security.VideoAdminIntegrationTest": 3,
    "com.investfacil.api.security.ExtendedIntegrationTest": 8,
}
MIN_TOTAL = 18
REPORT_GLOB = "backend/target/surefire-reports/TEST-*.xml"


def fail(message: str) -> None:
    print(f"SECURITY INTEGRATION GATE: FAIL - {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    reports = glob.glob(REPORT_GLOB)
    if not reports:
        fail(f"no surefire reports found at {REPORT_GLOB}")

    total = failures = errors = skipped = 0
    by_class: dict[str, dict[str, int]] = {}
    for path in reports:
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as exc:
            fail(f"invalid XML report {path}: {exc}")
        suite = root if root.tag == "testsuite" else root.find("testsuite")
        if suite is None:
            fail(f"missing testsuite in {path}")
        counts = {
            key: int(suite.attrib.get(key, "0"))
            for key in ("tests", "failures", "errors", "skipped")
        }
        total += counts["tests"]
        failures += counts["failures"]
        errors += counts["errors"]
        skipped += counts["skipped"]
        by_class[suite.attrib.get("name", path)] = counts

    if failures or errors:
        fail(f"failures={failures} errors={errors}")
    if skipped:
        fail(f"skipped={skipped}; security suites may not be silently skipped")
    if total < MIN_TOTAL:
        fail(f"total tests={total} < required {MIN_TOTAL}")

    for class_name, minimum in REQUIRED.items():
        counts = by_class.get(class_name)
        if counts is None:
            fail(f"required suite did not run: {class_name}")
        if counts["tests"] < minimum:
            fail(f"{class_name} ran {counts['tests']} tests, expected >= {minimum}")
        if counts["failures"] or counts["errors"] or counts["skipped"]:
            fail(f"{class_name} has failures/errors/skips: {counts}")

    print(f"SECURITY INTEGRATION GATE: PASS ({total} tests, 0 failures, 0 errors, 0 skipped)")


if __name__ == "__main__":
    main()
