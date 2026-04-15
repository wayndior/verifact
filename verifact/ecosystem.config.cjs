// PM2 process manager config
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup   ← run the printed command to auto-start on reboot

module.exports = {
  apps: [
    {
      name: 'verifact-api',
      script: './server/start.js',
      // Node 18+ ESM support
      node_args: '--experimental-vm-modules',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      // Environment is loaded from .env by start.js — no duplication needed here
      env: {
        NODE_ENV: 'production',
      },
      // Logs
      error_file: '../logs/api-error.log',
      out_file: '../logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
