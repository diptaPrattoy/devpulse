# DevPulse API

DevPulse is an internal tech issue and feature tracker API for software teams. It allows users to report bugs, request features, view issues, and manage issue workflow based on role permissions.

## Live URL

```txt
https://devpulse-beryl.vercel.app
```

## Features

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Contributor and maintainer role authorization
- Create bug reports and feature requests
- View all issues with sorting and filtering
- View single issue details
- Contributors can update their own open issues
- Maintainers can update and delete any issue
- Raw PostgreSQL queries using native `pg`
- Modular TypeScript Express architecture

## Tech Stack

| Technology   | Usage                     |
| ------------ | ------------------------- |
| Node.js      | Runtime                   |
| TypeScript   | Backend language          |
| Express.js   | API framework             |
| PostgreSQL   | Database                  |
| pg           | PostgreSQL driver         |
| bcrypt       | Password hashing          |
| jsonwebtoken | JWT authentication        |
| dotenv       | Environment configuration |
| cors         | Cross-origin support      |

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

Create a `.env` file in the root directory and add the required environment variables.

### 4. Create database tables

Run the SQL file below in your PostgreSQL database:

```txt
database/schema.sql
```

### 5. Run the project

```bash
npm run dev
```

### 6. Build the project

```bash
npm run build
```

## API Endpoints

### Auth

| Method | Endpoint           | Access | Description             |
| ------ | ------------------ | ------ | ----------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user     |
| POST   | `/api/auth/login`  | Public | Login and get JWT token |

### Issues

| Method | Endpoint          | Access          | Description        |
| ------ | ----------------- | --------------- | ------------------ |
| POST   | `/api/issues`     | Authenticated   | Create a new issue |
| GET    | `/api/issues`     | Public          | Get all issues     |
| GET    | `/api/issues/:id` | Public          | Get single issue   |
| PATCH  | `/api/issues/:id` | Authenticated   | Update an issue    |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue    |

## Query Parameters for Issues

```txt
GET /api/issues?sort=newest&type=bug&status=open
```

| Parameter | Values                            |
| --------- | --------------------------------- |
| `sort`    | `newest`, `oldest`                |
| `type`    | `bug`, `feature_request`          |
| `status`  | `open`, `in_progress`, `resolved` |

## Database Schema Summary

### users

| Field        | Description                   |
| ------------ | ----------------------------- |
| `id`         | Unique user ID                |
| `name`       | User full name                |
| `email`      | Unique login email            |
| `password`   | Hashed password               |
| `role`       | `contributor` or `maintainer` |
| `created_at` | Account creation time         |
| `updated_at` | Last update time              |

### issues

| Field         | Description                          |
| ------------- | ------------------------------------ |
| `id`          | Unique issue ID                      |
| `title`       | Issue title                          |
| `description` | Issue details                        |
| `type`        | `bug` or `feature_request`           |
| `status`      | `open`, `in_progress`, or `resolved` |
| `reporter_id` | ID of the user who created the issue |
| `created_at`  | Issue creation time                  |
| `updated_at`  | Last update time                     |

## Role Permissions

| Role        | Permissions                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| Contributor | Register, login, create issues, view issues, update own open issues         |
| Maintainer  | All contributor permissions, update any issue, change status, delete issues |
