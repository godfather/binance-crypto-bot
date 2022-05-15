module.exports = {
  apps : [{
    name   : "BOT",
    script : "./dist/index.js",
    cwd: '/bot',
    instances: 1,
    autorestart: true,
    max_restarts: 100,
    restart_delay: 300,
    max_memory_restart: '300M',
  }]
}
