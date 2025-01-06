module.exports = {
  apps: [
    // Production apps
    {
      name: 'echochambers-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: '30s',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048'
      },
    },
    {
      name: 'echochambers-server',
      script: './server/index.ts',
      interpreter: 'node',
      interpreter_args: '-r ts-node/register',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: '30s',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048'
      },
    },
    // Development apps
    {
      name: 'dev-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev',
      watch: [
        'app',
        'components',
        'lib',
        'utils',
        'server',
        'next.config.js',
        'next.config.mjs'
      ],
      ignore_watch: [
        'node_modules',
        '.next',
        '*.db*',
        '*.log',
        'chat.db-*'
      ],
      max_memory_restart: '2G',
      kill_timeout: 3000,
      wait_ready: true,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
    },
    {
      name: 'dev-server',
      script: 'ts-node',
      args: '--project tsconfig.server.json server/index.ts',
      watch: [
        'server',
        'lib',
        'utils'
      ],
      ignore_watch: [
        'node_modules',
        '.next',
        '*.db*',
        '*.log',
        'chat.db-*'
      ],
      max_memory_restart: '2G',
      kill_timeout: 3000,
      wait_ready: true,
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
    },
  ],
}
