require('dotenv').config()

const resolveSSL = (envName, host) => {
	if (envName === 'production') {
		const flag = process.env.DB_SSL_PROD
		if (typeof flag === 'string') return flag.toLowerCase() === 'true'
		return host && !['localhost', '127.0.0.1'].includes(String(host).toLowerCase())
	}
	const flag = process.env.DB_SSL
	if (typeof flag === 'string') return flag.toLowerCase() === 'true'
	return false
}

const devHost = process.env.DB_HOST
const prodHost = process.env.DB_HOST_PROD

module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: devHost,
		port: process.env.DB_PORT,
		dialect: 'postgres',
		logging: false,
		...(resolveSSL('development', devHost) ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}),
	},
	production: {
		username: process.env.DB_USER_PROD,
		password: process.env.DB_PASSWORD_PROD,
		database: process.env.DB_NAME_PROD,
		host: prodHost,
		port: process.env.DB_PORT_PROD,
		dialect: 'postgres',
		logging: false,
		...(resolveSSL('production', prodHost) ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}),
	},
}
