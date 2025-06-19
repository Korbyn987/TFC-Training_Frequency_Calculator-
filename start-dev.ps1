# Set environment variables
$env:NODE_ENV = "development"
$env:NODE_OPTIONS = "--openssl-legacy-provider"
$env:PORT = 3006

# Kill any existing node processes on port 3006
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*webpack*" } | Stop-Process -Force

# Change to the script directory
Set-Location -Path $PSScriptRoot

# Start the webpack dev server
Write-Host "Starting webpack development server on port $env:PORT..."
npx webpack serve --config webpack.config.prod.js --mode development --port $env:PORT --open

# Keep the console window open
Write-Host "Press any key to continue..."
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
