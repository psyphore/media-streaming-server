module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'web-api',
      script: 'index.js',
      watch: true,
      ignore_watch: ['node_modules', 'store'],
      watch_options: {
        followSymlinks: false
      },
      env: {
        COMMON_VARIABLE: 'true',
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'cluster'
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@bitbucket.org:sipho_hlophe/node-media-service.git',
      path: '/var/www/api',
      'post-deploy': 'pm2 reload ecosystem.config.js --env production'
    },
    dev: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@bitbucket.org:sipho_hlophe/node-media-service.git',
      path: '/var/www/dev',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env dev',
      env: {
        NODE_ENV: 'dev'
      }
    }
  }
};
