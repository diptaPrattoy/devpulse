# DevPulse API

DevPulse is an internal tech issue and feature tracker API for software teams. It allows contributors and maintainers to report bugs, suggest features, view issues, and coordinate issue resolution.

## Live URL

```txt
https://your-devpulse-api-url.vercel.app
```

Replace this with your deployed Vercel, Render, or Railway URL.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Contributor and maintainer role authorization
- Create bug reports and feature requests
- Public issue listing with sorting and filtering
- Public single issue details
- Contributor can update only their own open issues
- Maintainer can update any issue and change workflow status
- Maintainer-only issue deletion
- Raw PostgreSQL queries using the native `pg` driver
- No ORM, no query builder, no SQL JOINs
- Centralized success/error response formatting
- Strict TypeScript modular architecture

## Tech Stack

| Technology | Usage |
| --- | --- |
| Node.js 24+ | Runtime |
| TypeScript | Strict backend code |
| Express.js | REST API server |
| PostgreSQL | Relational database |
| pg | Native PostgreSQL driver |
| Raw SQL | Direct `pool.query()` calls |
| bcrypt | Password hashing |
| jsonwebtoken | JWT signing and verification |
| http-status-codes | Consistent HTTP status constants |
| cors | Cross-origin request support |
| dotenv | Environment variables |

## Folder Structure

```txt
devpulse-api/
├── api/
│   └── index.ts
├── database/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   └── issues/
│   │       ├── issues.controller.ts
│   │       ├── issues.routes.ts
│   │       └── issues.service.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   ├── appError.ts
│   │   ├── asyncHandler.ts
│   │   └── validators.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json
```

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

### 4. Create database tables

Run the SQL from `database/schema.sql` in your PostgreSQL database.

For local PostgreSQL:

```bash
psql "postgresql://postgres:password@localhost:5432/devpulse" -f database/schema.sql
```

For NeonDB, Supabase, or Railway, open the SQL editor and paste the contents of `database/schema.sql`.

### 5. Run in development

```bash
npm run dev
```

### 6. Build and run production version

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Local server port. Defaults to `5000`. |
| `NODE_ENV` | No | Use `production` in deployment. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWTs. Use a long random string. |
| `JWT_EXPIRES_IN` | No | JWT expiry time. Defaults to `7d`. |
| `BCRYPT_SALT_ROUNDS` | No | Salt rounds from 8 to 12. Defaults to `10`. |
| `CORS_ORIGIN` | No | Allowed origin. Use `*` for public API testing. |

## Database Schema Summary

### users

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key |
| `name` | `VARCHAR(120)` | Required |
| `email` | `VARCHAR(255)` | Required and unique |
| `password` | `TEXT` | Required bcrypt hash, never returned |
| `role` | `VARCHAR(20)` | `contributor` or `maintainer`, defaults to `contributor` |
| `created_at` | `TIMESTAMPTZ` | Auto-generated |
| `updated_at` | `TIMESTAMPTZ` | Refreshed in application updates |

### issues

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key |
| `title` | `VARCHAR(150)` | Required, max 150 characters |
| `description` | `TEXT` | Required, min 20 characters |
| `type` | `VARCHAR(30)` | `bug` or `feature_request` |
| `status` | `VARCHAR(30)` | `open`, `in_progress`, or `resolved`, defaults to `open` |
| `reporter_id` | `INTEGER` | User id validated in application logic |
| `created_at` | `TIMESTAMPTZ` | Auto-generated |
| `updated_at` | `TIMESTAMPTZ` | Refreshed in application updates |

## API Endpoints

Base URL:

```txt
http://localhost:5000
```

### Auth Module

#### Register User

```http
POST /api/auth/signup
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00.000Z",
    "updated_at": "2026-01-20T09:00:00.000Z"
  }
}
```

#### Login User

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00.000Z",
      "updated_at": "2026-01-20T09:00:00.000Z"
    }
  }
}
```

### Issues Module

#### Create Issue

```http
POST /api/issues
Authorization: <JWT_TOKEN>
```

Request body:

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

#### Get All Issues

```http
GET /api/issues?sort=newest&type=bug&status=open
```

Available query parameters:

| Param | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

#### Get Single Issue

```http
GET /api/issues/:id
```

#### Update Issue

```http
PATCH /api/issues/:id
Authorization: <JWT_TOKEN>
```

Request body for contributor or maintainer:

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

Maintainers may also update status in the same endpoint:

```json
{
  "status": "in_progress"
}
```

Permission rules:

- Maintainer can update any issue.
- Maintainer can update workflow status.
- Contributor can update only their own issue.
- Contributor can update only while the issue status is `open`.
- Contributor cannot change status.

#### Delete Issue

```http
DELETE /api/issues/:id
Authorization: <JWT_TOKEN>
```

Only maintainers can delete issues.

## Standard Response Patterns

### Success

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## Deployment Notes

### Deploy on Vercel

1. Push this project to GitHub.
2. Create a PostgreSQL database using NeonDB, Supabase, or Railway.
3. Run `database/schema.sql` in the hosted database.
4. Import the GitHub repository into Vercel.
5. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `BCRYPT_SALT_ROUNDS`
   - `CORS_ORIGIN`
   - `NODE_ENV=production`
6. Deploy.

### Deploy on Render or Railway

Use these commands:

```bash
npm install
npm run build
npm start
```

Set the same environment variables listed above.

## Testing with cURL

Register a maintainer:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@devpulse.com","password":"securePassword123","role":"maintainer"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devpulse.com","password":"securePassword123"}'
```

Create issue:

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"title":"Database connection timeout under load","description":"Pool exhausts after 50+ concurrent queries, causing 500 errors","type":"bug"}'
```

Get issues:

```bash
curl http://localhost:5000/api/issues?sort=newest
```

Update issue:

```bash
curl -X PATCH http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"status":"in_progress"}'
```

Delete issue:

```bash
curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "Authorization: YOUR_JWT_TOKEN"
```

## Final Submission Checklist

```txt
GitHub Repo (Public):      https://github.com/yourusername/devpulse
Live Deployment (Public):  https://your-devpulse-api-url.vercel.app
Interview Video (Public):  https://drive.google.com/... or https://youtu.be/...
```

## Academic Integrity Note

This codebase is structured as an implementation guide and working project foundation. Review it carefully, understand every file, make your own commits progressively, and be ready to explain the authentication, middleware, PostgreSQL queries, and role authorization in your oral defense.
