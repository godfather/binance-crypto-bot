module.exports = {
  apps : [{
    name   : "BOT",
    script : "./dist/main.js",
    cwd: '/bot',
    instances: 1,
    autorestart: true,
    max_restarts: 100,
    restart_delay: 300,
    watch:true,
    max_memory_restart: '300M',
    cron_restart: '0 0 * * *',
  }]
}
