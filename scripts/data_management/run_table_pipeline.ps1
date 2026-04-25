param(
  [switch]$Force,
  [switch]$IncludeScanned,
  [switch]$VisionOnly,
  [int]$ScannedLimit = 0
)

$ErrorActionPreference = "Stop"

Write-Host "[1/3] Extract textual PDFs..."
$cmd1 = "python scripts/extract_pdf_tables.py"
if ($Force) { $cmd1 += " --force" }
Invoke-Expression $cmd1

if ($IncludeScanned) {
  Write-Host "[2/3] Extract scanned PDFs..."
  $cmd2 = "python scripts/extract_scanned_tables.py"
  if ($Force) { $cmd2 += " --force" }
  if ($VisionOnly) { $cmd2 += " --vision-only" }
  if ($ScannedLimit -gt 0) { $cmd2 += " --limit $ScannedLimit" }
  Invoke-Expression $cmd2
}

Write-Host "[3/3] Merge extracted tables..."
$cmd3 = "python scripts/merge_from_extracted_tables.py"
if ($IncludeScanned) { $cmd3 += " --include-scanned" }
Invoke-Expression $cmd3

Write-Host "Done. Logs under data/celma-major-events-attachments/temp"
