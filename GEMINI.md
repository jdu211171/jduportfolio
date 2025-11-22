# Project Overview

This is a student portfolio management system designed for a university. It allows students to create and submit their portfolios, which are then reviewed and approved by university staff. Recruiters can then view the approved portfolios. The system is built with a React front-end and a Node.js back-end, and it uses a PostgreSQL database.

## Building and Running

### Client (React)

To build and run the client, navigate to the `portfolio-client` directory and use the following commands:

- **Install dependencies:** `npm install`
- **Run in development mode:** `npm run dev`
- **Build for production:** `npm run build`
- **Lint:** `npm run lint`

### Server (Node.js)

To build and run the server, navigate to the `portfolio-server` directory and use the following commands:

- **Install dependencies:** `npm install`
- **Run in development mode:** `npm run dev`
- **Run in production mode:** `npm start`
- **Run database migrations:** `npm run migrate`
- **Run database seeders:** `npm run seed`

## Development Conventions

- **Code Formatting:** The project uses Prettier for code formatting. You can format the code by running `npm run format` in both the `portfolio-client` and `portfolio-server` directories.
- **Linting:** The front-end uses ESLint for linting. You can check for linting errors by running `npm run lint` in the `portfolio-client` directory.
- **Database:** The project uses Sequelize for database migrations and seeding. Migrations are located in the `portfolio-server/migrations` directory, and seeders are located in the `portfolio-server/seeders` directory.
- **API:** The back-end provides a RESTful API for the front-end. The API routes are defined in the `portfolio-server/src/routes.js` file.
- **Authentication:** The application uses JSON Web Tokens (JWT) for authentication. The authentication logic is handled by the `passport` middleware on the back-end.
