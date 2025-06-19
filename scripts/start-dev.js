const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '3006';
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

console.log('Starting development server...');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

// Check if webpack-dev-server is installed
try {
  require.resolve('webpack-dev-server');
} catch (e) {
  console.error('webpack-dev-server is not installed. Installing...');
  const install = spawn('npm', ['install', '--save-dev', 'webpack-dev-server'], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('Failed to install webpack-dev-server');
      process.exit(1);
    }
    startDevServer();
  });
} finally {
  startDevServer();
}

function startDevServer() {
  const webpackConfigPath = path.resolve(__dirname, '..', 'webpack.config.js');
  
  if (!fs.existsSync(webpackConfigPath)) {
    console.error('webpack.config.js not found');
    process.exit(1);
  }

  // On Windows, we need to use npx to run webpack-dev-server
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = [
    'webpack-dev-server',
    '--config',
    `"${webpackConfigPath}"`,  // Wrap paths in quotes
    '--mode',
    'development',
    '--open',
    '--port',
    process.env.PORT,
    '--hot'
  ];

  console.log('Starting webpack-dev-server with args:', args.join(' '));
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
    cwd: path.resolve(__dirname, '..')
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`webpack-dev-server exited with code ${code}`);
      process.exit(code);
    }
  });

  process.on('SIGINT', () => {
    console.log('Stopping development server...');
    child.kill('SIGINT');
    process.exit(0);
  });
}
