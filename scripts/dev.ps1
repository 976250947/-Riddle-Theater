$workspace = Split-Path $PSScriptRoot -Parent

$tasks = @(
  @{ Name = "web"; Command = "npm run dev:web" },
  @{ Name = "api"; Command = "npm run dev:api" }
)

$children = @()

try {
  foreach ($task in $tasks) {
    $children += Start-Process -FilePath "cmd.exe" -ArgumentList "/d", "/s", "/c", $task.Command -WorkingDirectory $workspace -NoNewWindow -PassThru
  }

  Wait-Process -Id $children.Id
}
finally {
  foreach ($child in $children) {
    if ($null -ne $child) {
      try {
        if (-not $child.HasExited) {
          Stop-Process -Id $child.Id -Force -ErrorAction SilentlyContinue
        }
      }
      catch {
      }
    }
  }
}