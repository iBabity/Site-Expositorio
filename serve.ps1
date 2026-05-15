param(
  [int]$Port = 8000
)

$root = (Resolve-Path $PSScriptRoot).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".js" { "application/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".svg" { "image/svg+xml"; break }
    default { "application/octet-stream"; break }
  }
}

function Send-Response($stream, $status, $contentType, [byte[]]$body) {
  $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

$listener.Start()
Write-Host "DermaBio Expo rodando em http://localhost:$Port/"
Write-Host "Na mesma rede Wi-Fi, use o IP do computador com a porta $Port."
Write-Host "Pressione Ctrl+C para parar."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $client.ReceiveTimeout = 2000
    $client.SendTimeout = 2000
    $stream = $client.GetStream()
    $requestText = ""
    $buffer = [byte[]]::new(4096)

    try {
      while ($stream.DataAvailable -or [string]::IsNullOrEmpty($requestText)) {
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) {
          break
        }

        $requestText += [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)

        if ($requestText.Contains("`r`n`r`n")) {
          break
        }
      }
    } catch {
      $requestText = ""
    }

    $requestLine = ($requestText -split "`r`n")[0]
    $requestPath = "index.html"

    if ($requestLine -match "^[A-Z]+\s+([^?\s]+)") {
      $requestPath = [System.Uri]::UnescapeDataString($Matches[1].TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }
    }

    $targetPath = Join-Path $root $requestPath
    $resolvedPath = $null

    if (Test-Path -LiteralPath $targetPath -PathType Leaf) {
      $resolvedPath = (Resolve-Path -LiteralPath $targetPath).Path
    }

    if ($resolvedPath -and $resolvedPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
      Send-Response $stream "200 OK" (Get-ContentType $resolvedPath) $bytes
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado.")
      Send-Response $stream "404 Not Found" "text/plain; charset=utf-8" $bytes
    }

    $stream.Dispose()
    $client.Dispose()
  }
} finally {
  $listener.Stop()
}
