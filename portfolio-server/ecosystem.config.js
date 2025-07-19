module.exports = {
	apps: [
		{
			name: 'portfolio-server',
			script: './src/app.js',
			exec_mode: 'fork', // Always use fork mode
			instances: 1, // Single instance for kintone sync
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
				PORT: 5000,
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 5000,
			},
			error_file: './logs/err.log',
			out_file: './logs/out.log',
			log_file: './logs/combined.log',
			time: true,
		},
	],
}
