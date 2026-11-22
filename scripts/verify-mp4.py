"""Verify an exported MP4 without external tools.

Usage:
  python scripts/verify-mp4.py <file.mp4>
"""

import os
import sys


def read_boxes(data, start, end):
    while start + 8 <= end:
        size = int.from_bytes(data[start:start + 4], "big")
        box_type = data[start + 4:start + 8].decode("latin1")
        header = 8
        if size == 1:
            if start + 16 > end:
                break
            size = int.from_bytes(data[start + 8:start + 16], "big")
            header = 16
        elif size == 0:
            size = end - start
        if size < header or start + size > end:
            break
        yield box_type, start + header, start + size
        start += size


def find_box(data, start, end, target):
    for box_type, payload_start, payload_end in read_boxes(data, start, end):
        if box_type == target:
            return payload_start, payload_end
    return None


def parse_mvhd(data, start, end):
    version = data[start]
    if version == 0:
        timescale = int.from_bytes(data[start + 12:start + 16], "big")
        duration = int.from_bytes(data[start + 16:start + 20], "big")
    else:
        timescale = int.from_bytes(data[start + 20:start + 24], "big")
        duration = int.from_bytes(data[start + 24:start + 32], "big")
    return timescale, duration


def parse_trak(data, start, end):
    track = {"handler": None, "codec": None, "width": None, "height": None,
             "timescale": None, "duration": None, "samples": 0}
    tkhd = find_box(data, start, end, "tkhd")
    if tkhd:
        payload = data[tkhd[0]:tkhd[1]]
        track["width"] = int.from_bytes(payload[-8:-4], "big") / 65536.0
        track["height"] = int.from_bytes(payload[-4:], "big") / 65536.0
    mdia = find_box(data, start, end, "mdia")
    if not mdia:
        return track
    hdlr = find_box(data, mdia[0], mdia[1], "hdlr")
    if hdlr:
        track["handler"] = data[hdlr[0] + 8:hdlr[0] + 12].decode("latin1")
    mdhd = find_box(data, mdia[0], mdia[1], "mdhd")
    if mdhd:
        version = data[mdhd[0]]
        if version == 0:
            track["timescale"] = int.from_bytes(data[mdhd[0] + 12:mdhd[0] + 16], "big")
            track["duration"] = int.from_bytes(data[mdhd[0] + 16:mdhd[0] + 20], "big")
        else:
            track["timescale"] = int.from_bytes(data[mdhd[0] + 20:mdhd[0] + 24], "big")
            track["duration"] = int.from_bytes(data[mdhd[0] + 24:mdhd[0] + 32], "big")
    minf = find_box(data, mdia[0], mdia[1], "minf")
    if minf:
        stbl = find_box(data, minf[0], minf[1], "stbl")
        if stbl:
            stsd = find_box(data, stbl[0], stbl[1], "stsd")
            if stsd and stsd[0] + 16 <= stsd[1]:
                track["codec"] = data[stsd[0] + 12:stsd[0] + 16].decode("latin1")
            stts = find_box(data, stbl[0], stbl[1], "stts")
            if stts:
                entries = int.from_bytes(data[stts[0] + 4:stts[0] + 8], "big")
                cursor = stts[0] + 8
                total = 0
                for _ in range(entries):
                    total += int.from_bytes(data[cursor:cursor + 4], "big")
                    cursor += 8
                track["samples"] = total
    return track


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: python scripts/verify-mp4.py <file.mp4>")
    path = sys.argv[1]
    if not os.path.exists(path):
        raise SystemExit("missing file: " + path)
    size = os.path.getsize(path)
    data = open(path, "rb").read()
    print("file:", path)
    print("size_bytes:", size)
    print("size_mb:", round(size / (1024 * 1024), 2))
    if size == 0:
        raise SystemExit("empty file")

    ftyp = find_box(data, 0, len(data), "ftyp")
    if ftyp:
        major = data[ftyp[0]:ftyp[0] + 4].decode("latin1")
        print("ftyp:", major)
    else:
        print("ftyp: MISSING")

    moov = find_box(data, 0, len(data), "moov")
    if not moov:
        raise SystemExit("moov box missing; invalid MP4")
    mvhd = find_box(data, moov[0], moov[1], "mvhd")
    if not mvhd:
        raise SystemExit("mvhd box missing")
    timescale, duration = parse_mvhd(data, mvhd[0], mvhd[1])
    seconds = duration / timescale if timescale else 0
    print("duration_seconds:", round(seconds, 3))

    tracks = []
    for box_type, start, end in read_boxes(data, moov[0], moov[1]):
        if box_type == "trak":
            tracks.append(parse_trak(data, start, end))

    for index, track in enumerate(tracks, start=1):
        track_seconds = (track["duration"] / track["timescale"]
                         if track["timescale"] and track["duration"] else 0)
        fps = (track["samples"] / track_seconds) if track_seconds and track["samples"] else 0
        print(f"track_{index}: handler={track['handler']} codec={track['codec']} "
              f"size={track['width']}x{track['height']} "
              f"duration={round(track_seconds, 3)} samples={track['samples']} fps={round(fps, 3)}")

    video = [t for t in tracks if t["handler"] == "vide"]
    audio = [t for t in tracks if t["handler"] == "soun"]
    print("has_video:", bool(video))
    print("has_audio:", bool(audio))
    if video:
        print("video_size:", f"{video[0]['width']:.0f}x{video[0]['height']:.0f}")
        print("video_codec:", video[0]["codec"])
    if audio:
        print("audio_codec:", audio[0]["codec"])


if __name__ == "__main__":
    main()
