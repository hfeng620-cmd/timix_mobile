// =============================================================================
// PM2 Ecosystem Configuration — Timin Next.js Application
// Usage: pm2 start ecosystem.config.cjs
//        pm2 reload ecosystem.config.cjs   (zero-downtime deploy)
// =============================================================================

module.exports = {
  apps: [
    {
      // Display name in PM2 process list
      name: "timin",

      // Next.js CLI entry point (relative to this file's directory)
      script: "node_modules/.bin/next",

      // CLI arguments passed to the script
      args: "start -p 3000",

      // Run 2 instances in cluster mode for concurrency and rolling reloads
      instances: 2,
      exec_mode: "cluster",

      // Load environment variables from .env.local
      env_file: ".env.local",

      // Merge PM2's own env on top (don't wipe process.env)
      merge_logs: true,

      // Restart automatically if the app crashes
      autorestart: true,

      // Wait before considering a restart successful (ms)
      min_uptime: "10s",

      // Maximum number of restarts within the window before giving up
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
