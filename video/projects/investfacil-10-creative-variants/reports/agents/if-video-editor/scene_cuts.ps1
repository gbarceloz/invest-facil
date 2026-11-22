# Gate 4 — deteccao de cortes de cena (lower bound) para os 10 MP4.
$ff = $env:INVESTFACIL_FFMPEG
if (-not $ff) { $ff = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source }
if (-not $ff) { throw "ffmpeg nao encontrado; defina INVESTFACIL_FFMPEG ou adicione ao PATH" }
$base = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Get-ChildItem "$base\V*\render\*.mp4" | Sort-Object Name | ForEach-Object {
  $name = $_.BaseName
  $lines = & $ff -hide_banner -i $_.FullName -vf "select='gt(scene,0.05)',showinfo" -vsync vfr -f null NUL 2>&1
  $times = @()
  foreach ($l in $lines) {
    if ($l -match "pts_time:([0-9.]+)") { $times += [math]::Round([double]$matches[1], 2) }
  }
  $dur = [math]::Round(((& $ff -hide_banner -i $_.FullName 2>&1 | Select-String "Duration:") -replace ".*Duration: ([0-9:.]+),.*", '$1' | ForEach-Object { $p = $_ -split ':'; [double]$p[0]*3600 + [double]$p[1]*60 + [double]$p[2] })[0], 2)
  $avg = if ($times.Count -gt 0) { [math]::Round($dur / ($times.Count + 1), 2) } else { $dur }
  "$name | dur=$dur | cortes=$($times.Count) | media=$avg s | $($times -join ', ')"
}
