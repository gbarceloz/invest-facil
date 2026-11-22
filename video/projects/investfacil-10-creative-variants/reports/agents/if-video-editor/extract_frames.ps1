# Gate 4 — extracao de frames-chave para inspecao de edicao/legibilidade.
$ff = $env:INVESTFACIL_FFMPEG
if (-not $ff) { $ff = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source }
if (-not $ff) { throw "ffmpeg nao encontrado; defina INVESTFACIL_FFMPEG ou adicione ao PATH" }
$base = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$out = "$base\reports\agents\if-video-editor\_frames"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$jobs = @(
  @("V01", "V01-ticker-nao-para.mp4", 16.0),
  @("V01", "V01-ticker-nao-para.mp4", 20.0),
  @("V01", "V01-ticker-nao-para.mp4", 30.0),
  @("V02", "V02-cafe-de-sempre.mp4", 4.0),
  @("V02", "V02-cafe-de-sempre.mp4", 38.0),
  @("V03", "V03-maquina-de-encolher.mp4", 6.0),
  @("V04", "V04-100-em-30-segundos.mp4", 4.0),
  @("V05", "V05-nota-sobre-a-mesa.mp4", 20.0),
  @("V06", "V06-nao-e-impressao.mp4", 14.0),
  @("V07", "V07-linha-do-bolso.mp4", 10.0),
  @("V08", "V08-papo-de-mercado.mp4", 2.0),
  @("V09", "V09-imposto-invisivel.mp4", 6.0),
  @("V10", "V10-espelho-do-dinheiro.mp4", 12.0)
)
foreach ($j in $jobs) {
  $v = $j[0]; $f = $j[1]; $t = $j[2]
  $dest = "$out\$v-$($t.ToString('0.0')).png"
  & $ff -hide_banner -loglevel error -ss $t -i "$base\$v\render\$f" -frames:v 1 -y $dest
}
Get-ChildItem $out | Select-Object Name, Length | Format-Table -AutoSize
