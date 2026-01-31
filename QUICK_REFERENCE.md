# 🎯 SmartSlot Quick Reference

## 🚀 Start Application

### Option 1: Quick Start (Windows)
```bash
# Double-click this file:
start.bat
```

### Option 2: Command Line
```bash
# From project root
npm run dev
```

### Option 3: Start Separately
```bash
# Frontend only
npm run dev -w apps/frontend

# Backend only
npm run dev -w apps/backend
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://127.0.0.1:5173/ | React UI |
| **Backend API** | http://127.0.0.1:3000/api/v1 | REST API |
| **Health Check** | http://127.0.0.1:3000/health | Server status |
| **Database Studio** | `npm run db:studio` | Visual DB editor |

---

## 📁 Project Structure

```
hyper/
├── apps/
│   ├── frontend/               # React Frontend
│   │   ├── src/
│   │   │   ├── components/    # UI Components
│   │   │   ├── pages/         # Page Components
│   │   │   ├── design-system/ # Shared UI Elements
│   │   │   └── ...
│   │   └── vite.config.ts     # Vite + Proxy Config
│   │
│   └── backend/               # Express Backend
│       ├── src/
│       │   ├── routes/        # API Routes
│       │   ├── controllers/   # Business Logic
│       │   ├── middleware/    # Auth, Validation
│       │   └── ...
│       ├── prisma/            # Database Schema
│       └── .env              # Environment Variables
│
└── packages/
    └── shared/               # Shared Types
```

---

## 🔧 Common Commands

### Development
```bash
npm run dev              # Start both frontend & backend
npm run build            # Build production bundle
npm run lint             # Check code quality
```

### Database
```bash
npm run db:push          # Sync schema to database
npm run db:studio        # Open Prisma Studio GUI
npm run db:generate      # Generate Prisma Client
npm run db:seed          # Seed test data
```

### Testing
```bash
npm run test             # Run all tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

---

## 🎨 Lovable Integration Workflow

### 1. Identify Component to Enhance
```bash
# Example: Booking Confirmation
apps/frontend/src/components/booking/BookingConfirmation.tsx
```

### 2. Open Lovable & Generate
- Visit: https://lovable.dev
- Use prompts from `LOVABLE_PROMPTS_GUIDE.md`
- Review and iterate on design

### 3. Copy Code to Your Project
```bash
# Replace existing component
apps/frontend/src/components/booking/BookingConfirmation.tsx
```

### 4. Update Imports
```typescript
// Change from Lovable's imports
import { Button } from '@/components/ui/button';

// To your design system
import { Button } from '@/design-system';
```

### 5. Connect to API
```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { data } = useQuery({
  queryKey: ['bookings'],
  queryFn: () => axios.get('/api/v1/appointments')
});
```

### 6. Test
```bash
npm run dev
# Open http://127.0.0.1:5173/
```

---

## 🔐 Environment Variables

Location: `apps/backend/.env`

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **State**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT
- **Validation**: Zod

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules apps/frontend/node_modules
npm install
npm run dev
```

### Backend port in use
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

### Database issues
```bash
# Reset database
npm run db:push -w apps/backend

# Reseed data
npm run db:seed -w apps/backend
```

### TypeScript errors
```bash
# Regenerate Prisma Client
npm run db:generate -w apps/backend

# Check types
npm run typecheck -w apps/frontend
npm run typecheck -w apps/backend
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `LOVABLE_INTEGRATION_GUIDE.md` | Complete Lovable integration guide |
| `LOVABLE_PROMPTS_GUIDE.md` | Ready-to-use Lovable prompts |
| `QUICK_REFERENCE.md` | This file (quick commands) |
| `start.bat` | Quick start script (Windows) |

---

## 🎯 Next Steps

### To Enhance Your UI with Lovable:

1. ✅ Your app is running (frontend + backend)
2. 📖 Review `LOVABLE_PROMPTS_GUIDE.md`
3. 🎨 Pick a component to enhance
4. 🚀 Visit https://lovable.dev
5. 📋 Use the provided prompts
6. 🔧 Integrate the generated code
7. ✨ Test and iterate

### Recommended Enhancement Order:
1. Booking Confirmation (high visibility)
2. Dashboard (user's first screen)
3. Advanced Booking (core feature)
4. Login/Register (first impression)
5. Admin Panel (lower priority)

---

## 💡 Pro Tips

1. **Use the Proxy**: Your Vite config proxies `/api/*` to backend automatically
2. **Hot Reload**: Both frontend and backend support hot reload
3. **Type Safety**: Share types via `packages/shared`
4. **Lovable Compatibility**: Both use TailwindCSS v4 (fully compatible)
5. **Database GUI**: Use `npm run db:studio` for visual database editing

---

## 📞 Support

### Resources:
- **Lovable**: https://lovable.dev
- **TailwindCSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Prisma**: https://www.prisma.io/docs
- **React Query**: https://tanstack.com/query/latest

---

**You're all set! Happy coding! 🎉**

*Open http://127.0.0.1:5173/ in your browser to see your running application.*
