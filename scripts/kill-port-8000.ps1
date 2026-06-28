# Free port 8000 (Synapse backend)
$connections = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
    Write-Host "Port 8000 is not in use."
    exit 0
}
$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 }
foreach ($procId in $pids) {
    Write-Host "Stopping process $procId on port 8000..."
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
Get-Process python -ErrorAction SilentlyContinue | ForEach-Object {
    $listen = Get-NetTCPConnection -OwningProcess $_.Id -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq 8000 }
    if ($listen) {
        Write-Host "Stopping python PID $($_.Id)..."
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($still) {
    Write-Host "Warning: port 8000 may still be in use."
    exit 1
}
Write-Host "Port 8000 is free."
