# Backend Personal Project

This is the backend API system for the personal project, built with Express, Socket.io, Prisma, and MariaDB.

## 🛠️ Tech Stack & Technologies

* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database & ORM:** Prisma with MariaDB
* **Real-time Communication:** Socket.io
* **Security:** bcrypt, JSON Web Tokens (JWT)
* **File Uploads:** Multer

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory and configure your environment variables:
```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-super-secret-key"
PORT=3000
```

### 3. Database Migration & Seed
Run Prisma migrations to set up the database schema:
```bash
npx prisma migrate dev
npm run seed
```

### 4. Running the Development Server
```bash
npm run dev
```
