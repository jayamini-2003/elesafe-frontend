# Start Expo with the correct LAN IP (skips VirtualBox / link-local adapters)
$wifiIp = (
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254.*' -and
    $_.IPAddress -notlike '192.168.56.*' -and
    $_.InterfaceAlias -match 'Wi-Fi|Wireless|Hotspot'
  } |
  Select-Object -First 1 -ExpandProperty IPAddress
)

if (-not $wifiIp) {
  Write-Host "No Wi-Fi IP found. Connect to your phone hotspot first, then run again." -ForegroundColor Yellow
  exit 1
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $wifiIp
Write-Host "Using LAN IP: $wifiIp" -ForegroundColor Green
Write-Host "In Expo Go, connect to: exp://$wifiIp`:8081" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot\..
npx expo start --lan --clear
