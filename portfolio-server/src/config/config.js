require('dotenv').config(); // Load environment variables from .env

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    dialect: 'postgres',
    dialectModule: require('pg'),
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  },
  production: {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // This line can be omitted if your CA cert is trusted
      }
    },
    dialectModule: require('pg'),
    host: process.env.DB_HOST_PROD || 'localhost',
    port: process.env.DB_PORT_PROD || 5432,
    username: process.env.DB_USER_PROD || 'your_prod_user',
    password: process.env.DB_PASSWORD_PROD || 'your_prod_password',
    database: process.env.DB_NAME_PROD || 'your_production_database',
    logging: false,
  }
};

module.exports = {
  [env]: config[env],
  sequelizeOptions: {
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for automatically added attributes (createdAt, updatedAt)
    },
  }
};
