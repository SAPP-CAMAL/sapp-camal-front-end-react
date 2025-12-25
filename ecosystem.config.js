// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env' });

module.exports = {
    apps: [{
        name: "sapp",
        script: "./node_modules/next/dist/bin/next",
        args: "start",
        cwd: "./",
        env: {
            NODE_ENV: "production",
            PORT: process.env.PORT || 3001,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
        },
        instances: 1,
        exec_mode: "fork",
        max_memory_restart: "1G",
        watch: false,
        autorestart: true,
    }]
};