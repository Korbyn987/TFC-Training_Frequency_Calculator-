# Stop any running Node.js processes
Write-Host "Stopping any running Node.js processes..."
Get-Process | Where-Object { $_.ProcessName -eq 'node' -or $_.ProcessName -eq 'node.exe' } | Stop-Process -Force -ErrorAction SilentlyContinue

# Set the port
$env:WEB_PORT=3005

# Start the webpack dev server
Write-Host "Starting webpack development server on port $env:WEB_PORT..."
npx webpack serve --config webpack.config.web.js --mode development
