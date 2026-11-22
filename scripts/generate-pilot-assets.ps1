$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Speech

$root = Join-Path $PSScriptRoot "..\content\pilots\01-volatilidade"
$assets = Join-Path $root "assets"
New-Item -ItemType Directory -Force -Path $assets | Out-Null

function New-Slide {
  param(
    [string]$File,
    [string]$Eyebrow,
    [string]$Title,
    [string]$Body,
    [string]$Footer
  )
  $bmp = New-Object System.Drawing.Bitmap 1080, 1920
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $bg = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#050505"))
  $g.FillRectangle($bg, 0, 0, 1080, 1920)

  $gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(18, 255, 255, 255)), 1
  for ($x = 0; $x -lt 1080; $x += 90) { $g.DrawLine($gridPen, $x, 0, $x, 1920) }
  for ($y = 0; $y -lt 1920; $y += 90) { $g.DrawLine($gridPen, 0, $y, 1080, $y) }

  $accent = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FACC15"))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FAFAFA"))
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#A3A3A3"))
  $g.FillRectangle($accent, 90, 150, 112, 10)

  $brandFont = New-Object System.Drawing.Font "Segoe UI Semibold", 30, ([System.Drawing.FontStyle]::Bold)
  $eyebrowFont = New-Object System.Drawing.Font "Segoe UI Semibold", 30, ([System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font "Segoe UI Semibold", 88, ([System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font "Segoe UI", 46, ([System.Drawing.FontStyle]::Regular)
  $footerFont = New-Object System.Drawing.Font "Segoe UI", 26, ([System.Drawing.FontStyle]::Regular)

  $g.DrawString("INVEST FÁCIL", $brandFont, $white, 90, 80)
  $g.DrawString($Eyebrow, $eyebrowFont, $accent, 90, 210)

  $titleRect = New-Object System.Drawing.RectangleF 90, 340, 900, 620
  $format = New-Object System.Drawing.StringFormat
  $format.Trimming = [System.Drawing.StringTrimming]::Word
  $g.DrawString($Title, $titleFont, $white, $titleRect, $format)

  $bodyRect = New-Object System.Drawing.RectangleF 90, 1010, 900, 500
  $g.DrawString($Body, $bodyFont, $muted, $bodyRect, $format)

  $g.DrawString($Footer, $footerFont, $muted, (New-Object System.Drawing.RectangleF 90, 1700, 900, 120), $format)
  $g.DrawString("educação financeira • sem promessas", $footerFont, $muted, 90, 1810)

  $bmp.Save($File, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  $bg.Dispose(); $accent.Dispose(); $white.Dispose(); $muted.Dispose(); $gridPen.Dispose()
  $brandFont.Dispose(); $eyebrowFont.Dispose(); $titleFont.Dispose(); $bodyFont.Dispose(); $footerFont.Dispose()
}

New-Slide -File (Join-Path $assets "slide-01.png") `
  -Eyebrow "EDUCAÇÃO FINANCEIRA" `
  -Title "Volatilidade não é risco." `
  -Body "Preço que sobe e desce não é a mesma coisa que a chance de perder dinheiro de forma permanente." `
  -Footer "Aula 1 • Entenda o risco antes de investir"

New-Slide -File (Join-Path $assets "slide-02.png") `
  -Eyebrow "O QUE IMPORTA" `
  -Title "Risco é a chance de perder — e de precisar vender na hora errada." `
  -Body "Volatilidade: o preço oscila.`nRisco: a perda pode ser permanente.`nPrazo e reserva mudam a decisão." `
  -Footer "Diversificar não elimina o risco de mercado"

New-Slide -File (Join-Path $assets "slide-03.png") `
  -Eyebrow "PRIMEIRO PASSO" `
  -Title "Invista apenas o que você entende." `
  -Body "Reserva primeiro. Estudo depois. Desconfie de qualquer promessa de retorno garantido." `
  -Footer "Conteúdo educativo. Não é recomendação de investimento."

$wav = Join-Path $assets "narracao.wav"
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Maria Desktop")
$synth.Rate = -1
$synth.Volume = 100
$synth.SetOutputToWaveFile($wav)
$synth.Speak("Volatilidade é quando o preço sobe e desce. Isso, por si só, não é risco.")
$synth.Speak("Risco é a chance de você perder dinheiro de forma permanente, ou de precisar vender no pior momento.")
$synth.Speak("Por isso: monte sua reserva, estude o ativo e invista apenas o que você entende. Desconfie de qualquer promessa de retorno garantido.")
$synth.Dispose()

Get-ChildItem $assets | Select-Object Name, Length
