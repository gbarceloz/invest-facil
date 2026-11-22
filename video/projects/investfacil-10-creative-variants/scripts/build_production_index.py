"""Build the Gate 4 production index from the per-variant render manifests."""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = [f"V{i:02d}" for i in range(1, 11)]

rows = []
for vid in IDS:
    path = os.path.join(ROOT, vid, "render", "manifest.json")
    if not os.path.exists(path):
        rows.append({"variant": vid, "missing": True})
        continue
    with open(path, encoding="utf-8") as handle:
        rows.append(json.load(handle))

lines = [
    "# GATE 4 — ÍNDICE DE PRODUÇÃO",
    "",
    "**Data:** 21/11/2026",
    "**Status:** produção interna; nenhuma aprovação humana declarada.",
    "",
    "| ID | Arquivo | Duração | Resolução | Codec | Loudness | True peak | QC |",
    "|---|---|---:|---|---|---:|---:|---|",
]

for row in rows:
    vid = row["variant"]
    if row.get("missing"):
        lines.append(f"| {vid} | — | — | — | — | — | — | PENDENTE |")
        continue
    video = row["video"]
    loud = row["loudness"]
    qc_path = os.path.join(ROOT, vid, "render", "QC_REPORT.md").replace("\\", "/")
    lines.append(
        f"| {vid} | `{os.path.basename(row['file'])}` | {row['duration_s']:.2f} s | "
        f"{video['width']}×{video['height']} | {video['codec_name']}/{row['audio']['codec_name']} | "
        f"{loud['integrated_lufs']} LUFS | {loud['true_peak_dbfs']} dBTP | [QC]({qc_path}) |"
    )

lines += [
    "",
    "## Arquivos por variante",
    "",
]
for row in rows:
    vid = row["variant"]
    if row.get("missing"):
        lines.append(f"- **{vid}:** pendente.")
        continue
    lines.append(
        f"- **{vid}:** `{row['file']}` · frame 0: `{row['frame0']}` · contato: `{row['contact_sheet']}`"
    )

lines += [
    "",
    "## Declarações",
    "",
    "- Nenhum vídeo foi publicado, enviado ou monetizado.",
    "- Nenhuma escuta humana foi realizada.",
    "- Nenhuma licença comercial de voz foi declarada.",
    "- Loudness e true peak são medições; não substituem escuta.",
    "- Contact sheet não substitui reprodução integral.",
]

with open(os.path.join(ROOT, "reports", "GATE4_PRODUCTION_INDEX.md"), "w", encoding="utf-8") as handle:
    handle.write("\n".join(lines) + "\n")
print("written", len(rows), "rows")
