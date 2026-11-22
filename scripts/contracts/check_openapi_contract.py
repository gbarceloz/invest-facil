#!/usr/bin/env python3
"""Compare the exposed OpenAPI document with the versioned snapshot.

The snapshot is docs/contracts/openapi.json. The current document is produced by
backend/src/test/java/com/investfacil/api/contract/OpenApiSnapshotIntegrationTest
into backend/target/openapi-current.json.

Classification is intentionally conservative:
- removing a path, operation, parameter, response, schema or schema property is
  breaking;
- adding a required request field/parameter, changing a type, enum removal,
  security changes and operationId changes are breaking;
- additive fields, new endpoints, new optional parameters and new response
  codes are compatible (reported as warnings).

Exit codes: 0 compatible/no change, 1 breaking change, 2 missing input.
The script never modifies the snapshot. Updating it is a reviewed, manual step.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DOC_KEYS = {"description", "summary", "example", "examples", "title", "externalDocs"}
IGNORED_METHODS = {"parameters", "servers"}
ROOT = Path(__file__).resolve().parents[2]


class Report:
    def __init__(self) -> None:
        self.items: list[tuple[str, str, str]] = []

    def add(self, severity: str, path: str, message: str) -> None:
        self.items.append((severity, path, message))

    @property
    def breaking(self) -> list[tuple[str, str, str]]:
        return [item for item in self.items if item[0] == "BREAKING"]

    @property
    def compatible(self) -> list[tuple[str, str, str]]:
        return [item for item in self.items if item[0] == "COMPATIBLE"]

    def print(self) -> None:
        for severity, path, message in self.items:
            print(f"{severity:10} {path}: {message}")
        print()
        print(f"BREAKING={len(self.breaking)} COMPATIBLE={len(self.compatible)}")


def load(path: Path) -> dict:
    with path.open(encoding="utf-8-sig") as handle:
        spec = json.load(handle)
    if isinstance(spec, dict):
        spec.pop("servers", None)
        spec.pop("info", None)
    return spec


def severity_for_missing(trail: tuple[str, ...], key: str) -> str:
    if key == "security":
        return "BREAKING"
    return "BREAKING"


def severity_for_added(trail: tuple[str, ...], key: str) -> str:
    if key == "security":
        return "BREAKING"
    return "COMPATIBLE"


def compare_list(expected: list, actual: list, trail: tuple[str, ...], report: Report) -> None:
    where = ".".join(trail) or "$"
    key = trail[-1] if trail else ""

    if key in {"required", "enum"}:
        exp = {json.dumps(item, sort_keys=True) for item in expected}
        act = {json.dumps(item, sort_keys=True) for item in actual}
        for item in sorted(exp - act):
            severity = "BREAKING" if key == "enum" else "COMPATIBLE"
            report.add(severity, where, f"value removed: {item}")
        for item in sorted(act - exp):
            severity = "BREAKING" if key == "required" else "COMPATIBLE"
            report.add(severity, where, f"value added: {item}")
        return

    if key in {"tags"}:
        exp = {json.dumps(item, sort_keys=True) for item in expected}
        act = {json.dumps(item, sort_keys=True) for item in actual}
        for item in sorted(exp ^ act):
            report.add("COMPATIBLE", where, f"tag metadata changed: {item}")
        return

    if key == "parameters":
        def keyed(items: list) -> dict:
            return {
                f"{item.get('in', '?')}:{item.get('name', '?')}": item
                for item in items
                if isinstance(item, dict)
            }

        exp = keyed(expected)
        act = keyed(actual)
        for name in sorted(set(exp) - set(act)):
            report.add("BREAKING", where, f"parameter removed: {name}")
        for name in sorted(set(act) - set(exp)):
            required = bool(act[name].get("required"))
            report.add("BREAKING" if required else "COMPATIBLE", where,
                       f"parameter added: {name} (required={required})")
        for name in sorted(set(exp) & set(act)):
            compare_node(exp[name], act[name], trail + (name,), report)
        return

    if key == "security":
        exp = json.dumps(expected, sort_keys=True)
        act = json.dumps(actual, sort_keys=True)
        if exp != act:
            report.add("BREAKING", where, "security requirements changed")
        return

    if len(expected) != len(actual):
        report.add("BREAKING", where,
                   f"array size changed {len(expected)} -> {len(actual)}")
    for index in range(min(len(expected), len(actual))):
        compare_node(expected[index], actual[index], trail + (f"[{index}]",), report)


def compare_node(expected, actual, trail: tuple[str, ...], report: Report) -> None:
    where = ".".join(trail) or "$"
    if expected == actual:
        return

    if isinstance(expected, dict) and isinstance(actual, dict):
        for key in sorted(set(expected) - set(actual)):
            if key in DOC_KEYS:
                continue
            report.add(severity_for_missing(trail, key), where + "." + key, "removed")
        for key in sorted(set(actual) - set(expected)):
            if key in DOC_KEYS:
                continue
            report.add(severity_for_added(trail, key), where + "." + key, "added")
        for key in sorted(set(expected) & set(actual)):
            if key in DOC_KEYS:
                continue
            if key == "deprecated":
                if expected[key] != actual[key]:
                    report.add("COMPATIBLE", where + ".deprecated",
                               f"{expected[key]} -> {actual[key]}")
                continue
            compare_node(expected[key], actual[key], trail + (key,), report)
        return

    if isinstance(expected, list) and isinstance(actual, list):
        compare_list(expected, actual, trail, report)
        return

    report.add("BREAKING", where, f"value changed: {expected!r} -> {actual!r}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", default=str(ROOT / "docs/contracts/openapi.json"))
    parser.add_argument("--current", default=str(ROOT / "backend/target/openapi-current.json"))
    parser.add_argument("--report", default="")
    parser.add_argument("--strict", action="store_true",
                        help="fail on any difference, including compatible ones")
    args = parser.parse_args()

    snapshot_path = Path(args.snapshot)
    current_path = Path(args.current)
    if not snapshot_path.is_file():
        print(f"CONTRACT ERROR: snapshot not found: {snapshot_path}", file=sys.stderr)
        return 2
    if not current_path.is_file():
        print(f"CONTRACT ERROR: current spec not found: {current_path}", file=sys.stderr)
        print("Run: cd backend && mvn -B -Dtest=OpenApiSnapshotIntegrationTest test",
              file=sys.stderr)
        return 2

    report = Report()
    compare_node(load(snapshot_path), load(current_path), (), report)
    report.print()

    if args.report:
        target = Path(args.report)
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("w", encoding="utf-8", newline="\n") as handle:
            for severity, path, message in report.items:
                handle.write(f"{severity:10} {path}: {message}\n")
            handle.write(f"\nBREAKING={len(report.breaking)} "
                         f"COMPATIBLE={len(report.compatible)}\n")

    if report.breaking:
        print("CONTRACT FAIL: breaking changes require review and a manual snapshot update.")
        return 1
    if args.strict and report.compatible:
        print("CONTRACT FAIL (strict): compatible changes also require a snapshot update.")
        return 1
    if report.compatible:
        print("CONTRACT PASS WITH WARNINGS: compatible changes detected; "
              "update the snapshot in a reviewed change.")
    else:
        print("CONTRACT PASS: exposed API matches the snapshot.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
