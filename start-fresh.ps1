# Stop any running Node.js processes
Write-Host "Stopping any running Node.js processes..."
Get-Process | Where-Object { $_.ProcessName -eq 'node' -or $_.ProcessName -eq 'node.exe' } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear the console
Clear-Host

# Set environment variables
$env:NODE_ENV = "development"
$env:WEB_PORT = "3005"
$env:EXPO_DEBUG = "1"

# Install dependencies if needed
Write-Host "Checking dependencies..."
npm list --depth=0
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..."
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies. Please check your internet connection and try again."
        exit 1
    }
}

# Start the webpack dev server
Write-Host "Starting webpack development server on port $env:WEB_PORT..."
npx webpack serve --config webpack.config.web.js --mode development
