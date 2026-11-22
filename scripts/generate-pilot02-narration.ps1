$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech

$root = Join-Path $PSScriptRoot "..\content\pilots\02-diversificacao"
$out = Join-Path $root "assets\tts"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$lines = Get-Content (Join-Path $root "narracao.txt") -Encoding UTF8 |
  Where-Object { $_.Trim().Length -gt 0 }

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $env:INVESTFACIL_TTS_VOICE
if (-not $voice) { $voice = "Microsoft Maria Desktop" }
$synth.SelectVoice($voice)
$synth.Rate = -1
$synth.Volume = 100

$index = 0
foreach ($line in $lines) {
  $index++
  $file = Join-Path $out ("sentence-{0:D2}.wav" -f $index)
  $synth.SetOutputToWaveFile($file)
  $synth.Speak($line)
}

$synth.SetOutputToNull()
$synth.Dispose()

Get-ChildItem $out -Filter "sentence-*.wav" | Select-Object Name, Length
