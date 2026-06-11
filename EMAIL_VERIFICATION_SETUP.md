# SaloneCare Email Verification Setup Guide

## What's New

Your signup flow now includes:
1. ✅ **Full Name Field** - Users enter their full name during signup
2. ✅ **Email Verification** - Confirmation code sent to Gmail
3. ✅ **Auto-Login** - User is automatically logged in after verification
4. ✅ **Profile Creation** - Profile created with user name and role (patient/doctor/pharmacy)

## Environment Setup

### 1. Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (for local) or your production URL
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Configure Supabase Email Settings

In your Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Make sure **Confirmation** email template is enabled
3. (Optional) Customize the email template for your branding

### 3. Enable Email Confirmation in Supabase

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Under **Email Provider**, ensure:
   - ✅ Confirm email is **enabled**
   - Email confirmation window: Set to reasonable value (e.g., 24 hours)

## How It Works

### Signup Flow:
1. User visits `/signup`
2. User enters:
   - Full Name
   - Email
   - Password
   - Role (Patient/Doctor/Pharmacy)
3. Confirmation code is **sent to their Gmail**
4. User receives email with 6-digit confirmation code
5. User enters code in the verification screen
6. After successful verification:
   - User profile is created
   - User is automatically logged in
   - User is redirected to `/appointments`

### User Profile:
After verification, user can view their profile at `/profile` which displays:
- Full Name
- Role (Patient/Doctor/Pharmacy)
- Phone (optional)
- User ID

## Testing Locally

### Test Email Verification:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click **"Get Started"** → goes to `/signup`

4. Fill in the form:
   - Full Name: John Doe
   - Email: your-test@gmail.com
   - Password: test1234
   - Role: Patient

5. You'll be shown a verification screen and an email will be sent

6. Check your email inbox (might be in spam folder)

7. Copy the 6-digit verification code

8. Paste it into the verification screen

9. After verification, you'll be logged in and redirected to `/appointments`

10. Visit `/profile` to see your created profile

## API Endpoints

### POST `/api/auth/signup`
Handles user signup with email and metadata

**Request:**
```json
{
  "email": "user@gmail.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign up successful! A confirmation email has been sent.",
  "user": { /* user data */ }
}
```

### POST `/api/auth/verify`
Verifies the OTP and creates user profile

**Request:**
```json
{
  "email": "user@gmail.com",
  "token": "123456",
  "type": "signup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "user": { /* verified user data */ },
  "session": { /* auth session */ }
}
```

## Updated Pages

### `/signup` (UPDATED)
- Now includes full name field
- Two-step process: Signup → Email Verification
- Shows confirmation code input screen

### `/login` (UPDATED)
- Now redirects authenticated users to `/appointments`
- Better error handling

### `/profile` (NEW)
- Displays user profile information
- Shows name, role, phone, and user ID
- Logout button

## Database Changes

Your `profiles` table now automatically:
- Gets populated when email is verified
- Stores: `id`, `full_name`, `role`, `phone`, `avatar_url`
- Creates audit timestamps: `created_at`, `updated_at`

## Troubleshooting

### "This page could not be found" (404)

**Solution:** Make sure:
1. ✅ Environment variables are set in `.env.local`
2. ✅ Supabase project is properly configured
3. ✅ Run `npm run dev` in the correct directory
4. ✅ Port 3000 is not blocked

### Email not received

**Solution:**
1. Check spam/junk folder
2. Verify SMTP settings in Supabase Dashboard
3. Make sure email is properly formatted
4. Check Supabase logs for email errors

### Verification code invalid

**Solution:**
1. Code expires after 10 minutes - request a new one
2. Make sure you're entering the code from the latest email
3. Check code is 6 digits long

### Profile not created

**Solution:**
1. Verify that `profiles` table exists in Supabase
2. Check that RLS policies allow profile creation
3. Verify SUPABASE_SERVICE_ROLE_KEY is correct in `.env.local`

## Next Steps

1. **Test the flow** locally with test email
2. **Deploy to production** once verified
3. **Configure custom domain** in Supabase for production emails
4. **Set up email templates** with your branding
5. **Test with real emails** from Gmail, Outlook, etc.

## Security Notes

- Passwords are hashed by Supabase
- Confirmation codes are single-use and expire
- Service role key should only be in environment variables
- Never commit `.env.local` to version control
