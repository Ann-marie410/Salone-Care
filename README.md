This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🎯 Key Features

- **Email Verification** - Secure signup with confirmation code sent to Gmail
- **Auto-Login** - Users logged in automatically after email verification
- **Profile Creation** - User profiles created with name and role (Patient/Doctor/Pharmacy)
- **Doctor Appointments** - Book and manage appointments
- **Messaging** - Real-time chat with healthcare providers
- **AI Assistant** - Health guidance from intelligent assistant
- **Pharmacy Locator** - Find nearby pharmacies with GPS
- **Emergency Contacts** - Quick access to emergency services

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and click **"Get Started"** to test signup flow.

### Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔐 Authentication

**New Email Verification Signup Flow:**
1. Click "Get Started" → `/signup`
2. Enter: Full Name, Email, Password, Role
3. Confirmation code sent to email
4. Enter code to verify email
5. Auto-login and profile created
6. Redirected to `/appointments`

See [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md) for complete setup.

## 📁 Project Structure

- `/src/app` - Pages and API routes
- `/src/lib` - Supabase client config
- `/supabase` - Database migrations and seed data
- `/public` - Static assets

## 🔌 Main API Routes

- `POST /api/auth/signup` - User signup
- `POST /api/auth/verify` - Email verification
- `GET/POST /api/appointments` - Appointment management
- `GET /api/doctors` - List doctors
- `GET /api/pharmacies` - List pharmacies

## 📖 Documentation

- [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md) - Complete email setup guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Phase 2 details
- [PRD.md](./PRD.md) - Product requirements

## 🛠️ Commands

```bash
npm run dev    # Start dev server
npm run build  # Build production
npm start      # Run production
npm run lint   # Run linter
```

## 🚢 Deploy on Vercel

1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy

## ❓ Troubleshooting

**404 on signup?**
- Restart: `npm run dev`
- Check .env.local exists
- Clear browser cache

**Email not received?**
- Check spam folder
- Verify Supabase email config
- See EMAIL_VERIFICATION_SETUP.md

## 📝 License

MIT
