const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron')

const configureRoutes = require('./routes')
const KintoneService = require('./services/kintoneService')

const PORT = process.env.PORT || 5000

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Portfolio API',
			version: '1.0.0',
			description: 'API documentation for the Portfolio system',
		},
		servers: [
			{
				url: '/', // Use relative URL for same-origin requests
				description: 'Current server'
			}
		],
		components: {
			securitySchemes: {
				cookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'token',
					description: 'Authentication token stored in a cookie. Login first using the /api/auth/login endpoint.'
				}
			}
		},
		security: [
			{
				cookieAuth: []
			}
		]
	},
	apis: [
		'./src/routes/*.js', 
	],
};

const swaggerSpec = swaggerJSDoc(options);

// Enhanced Swagger UI configuration for cookie authentication
const swaggerOptions = {
	withCredentials: true,
	persistAuthorization: true,
	// Add request interceptor to ensure credentials are included
	requestInterceptor: (req) => {
		req.credentials = 'include';
		return req;
	}
};

// Load environment variables from .env file
dotenv.config()
const CronService = require('./services/cronService')
const app = express()




// Use cookie-parser middleware
app.use(cookieParser())
// Middleware to parse JSON bodies
app.use(express.json())
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, '../../portfolio-client/dist')))

// Configure CORS to allow credentials
app.use(cors({ 
	origin: '*',
	credentials: true
}))

// Configure routes
configureRoutes(app)

cron.schedule('0 4 * * *', async () => {
	console.log('syncing with kintone')
	await KintoneService.syncData()
})



CronService.scheduleJobs()

// Updated Swagger UI setup with enhanced options
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
	swaggerOptions,
	customCss: '.swagger-ui .auth-wrapper .authorize {padding: 15px 20px; display: block;}',
	customSiteTitle: "Portfolio API Documentation",
	customfavIcon: "",
	customCssUrl: "",
}));

app.get('*', (req, res) => {
	res.sendFile(
		path.resolve(__dirname, '../../portfolio-client/dist/index.html')
	)
})



// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
