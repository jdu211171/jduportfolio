require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

// Helper: decide whether to enable SSL for the active environment
const resolveSSL = (envName, host) => {
	// Production: default ON (Neon and most managed PG require TLS)
	if (envName === 'production') {
		const flag = process.env.DB_SSL_PROD
		if (typeof flag === 'string') return flag.toLowerCase() === 'true'
		return host && !['localhost', '127.0.0.1'].includes(String(host).toLowerCase())
	}

	// Development: default OFF; allow opt‑in via DB_SSL=true
	const flag = process.env.DB_SSL
	if (typeof flag === 'string') return flag.toLowerCase() === 'true'
	return false
}

const devHost = process.env.DB_HOST
const prodHost = process.env.DB_HOST_PROD || 'localhost'

const config = {
	development: {
		dialect: 'postgres',
		dialectModule: require('pg'),
		host: devHost,
		port: process.env.DB_PORT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		logging: false,
		...(resolveSSL('development', devHost)
			? {
					// Opt‑in SSL for dev when pointing at remote DB
					dialectOptions: {
						ssl: { require: true, rejectUnauthorized: false },
					},
				}
			: {}),
	},
	production: {
		dialect: 'postgres',
		dialectModule: require('pg'),
		host: prodHost,
		port: process.env.DB_PORT_PROD || 5432,
		username: process.env.DB_USER_PROD || 'your_prod_user',
		password: process.env.DB_PASSWORD_PROD || 'your_prod_password',
		database: process.env.DB_NAME_PROD || 'your_production_database',
		logging: false,
		...(resolveSSL('production', prodHost)
			? {
					// Require SSL in production unless explicitly disabled
					dialectOptions: {
						ssl: { require: true, rejectUnauthorized: false },
					},
				}
			: {}),
	},
}

module.exports = {
	[env]: config[env],
	sequelizeOptions: {
		define: { timestamps: true, underscored: true },
	},
}
