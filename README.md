# WatchMe API Backend

WatchMe API is the backend for the WatchMe project, connecting a React frontend and a Python AI service for facial recognition and people tracking in videos. This API is built with Node.js, TypeScript, Fastify, Knex/Objection, and PostgreSQL.

## Features
- User management with profile pictures
- Person management with AI-powered facial embeddings
- Video upload and management
- End-to-end integration with Python AI service
- Secure authentication (JWT)
- File upload validation (size, type)
- Comprehensive Swagger documentation

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (v10+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (local or Docker)
- [Git](https://git-scm.com/)
- (Optional) [Docker](https://www.docker.com/) for database

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/beatrizamante/watchme_api_backend.git
cd watchme_api_backend
```

### 2. Install dependencies
```sh
pnpm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and set your environment variables:
```sh
cp .env.example .env
```

### 4. Set up the database
- Make sure PostgreSQL is running
- Create the development database:
  ```sh
  pnpm db:create:dev
  ```
- Run migrations:
  ```sh
  pnpm db:migrate:dev
  ```
- (Optional) Seed the database:
  ```sh
  pnpm db:seed:dev
  ```

### 5. Start the API server
```sh
pnpm dev
```

The API will be available at `http://localhost:3000`.

### 6. Access Swagger Docs
Visit `http://localhost:3000/docs` for interactive API documentation.

## Project Structure
```
├── src/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── interface/
│   ├── uploads/
│   └── ...
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── README.md
└── ...
```

## Scripts
- `pnpm dev` — Start development server with hot reload
- `pnpm db:create:dev` — Create development database
- `pnpm db:migrate:dev` — Run migrations
- `pnpm db:seed:dev` — Seed database
- `pnpm db:rollback:dev` — Rollback migrations

## API Overview
- **Users**: Create, update, delete, list users and profile pictures
- **People**: Create, find, delete, list people with AI embeddings
- **Videos**: Upload, find, delete, list videos
- **AI Integration**: Communicate with Python AI service for facial recognition

## File Upload Policies
- **Images**: Only `.jpg`, `.jpeg`, `.png`, `.bmp`, `.gif`, `.webp`, `.tiff`, `.svg` allowed
- **Videos**: Only `.mp4`, `.mov`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`, `.m4v` allowed
- **Max file size**: 100MB

## Environment Variables
See `.env.example` for all required variables (database, JWT secret, etc).

## Contributing
Pull requests and issues are welcome! See [GitHub Issues](https://github.com/beatrizamante/watchme_api_backend/issues).

## License
ISC

---

**WatchMe API** — Built by [@beatrizamante](https://github.com/beatrizamante)
