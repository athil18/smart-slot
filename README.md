# 🚀 SmartSlot - Intelligent Booking Management System

Intelligent slot booking and management system built with React, Express, and Prisma.

## 🌐 Quick Access

- **Frontend**: http://127.0.0.1:5173/
- **Backend API**: http://127.0.0.1:3000/api/v1
- **API Health**: http://127.0.0.1:3000/health

## 🛠️ Features

- **Authentication**: JWT-based secure login and registration.
- **Roles**: Teacher, Admin, and Student role-based access.
- **Booking**: Real-time slot selection and appointment management.
- **Admin Panel**: Manage users, resources, and view audit logs.
- **UI/UX**: Modern glassmorphism design with Framer Motion animations.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
npm install
```

### Running Locally
```bash
# Start both frontend & backend
npm run dev

# Or use Windows shortcut
./start.bat
```

## 🏗️ Technical Stack

- **Frontend**: React 19, Vite 7, TailwindCSS 4, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite (Development)
- **Monorepo**: Turborepo

## 📂 Structure

- `apps/frontend`: React client application.
- `apps/backend`: Express server and Prisma schema.
- `packages/shared`: Common TypeScript types.

## 📜 License
MIT
