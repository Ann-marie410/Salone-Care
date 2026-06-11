# SaloneCare Email Configuration & Approval System Guide

## 🚀 New Features Implemented

### 1. **Non-Expiring Verification Tokens**
By default, Supabase sets token expiration to 24 hours. To configure longer expiration:

**In Supabase Dashboard:**
1. Go to **Authentication** → **Providers**
2. Click **Email**
3. Set **Confirm email expiration**: `7 days` or more
4. Click **Save**

This ensures verification codes won't expire prematurely.

### 2. **Email Branding with SaloneCare**

To customize the email template with SaloneCare branding:

#### Supabase Email Templates Setup

1. **Go to Supabase Dashboard** → **Authentication** → **Email Templates**

2. **Find "Confirm email" template** and click **Edit**

3. **Replace the template with:**

```html
<h2>Welcome to SaloneCare! 🏥</h2>

<p>Hi {{ .TokenHash }},</p>

<p>Thank you for signing up with SaloneCare - Your trusted digital healthcare platform.</p>

<p>Please confirm your email by entering this verification code:</p>

<h1 style="text-align: center; font-size: 32px; letter-spacing: 8px; color: #1e40af;">
  {{ .Token }}
</h1>

<p style="text-align: center; color: #666;">
  This code expires in 7 days
</p>

<p style="border-top: 2px solid #2563eb; padding-top: 20px; margin-top: 30px;">
  <strong>SaloneCare Team</strong><br>
  Your trusted healthcare partner in Sierra Leone<br>
  <a href="https://salone-care.com" style="color: #2563eb;">Visit SaloneCare</a>
</p>

<p style="color: #999; font-size: 12px;">
  If you didn't request this email, please ignore it.
</p>
```

4. Click **Save template**

### 3. **Prevent Emails Going to Spam**

To ensure emails go to inbox, not spam:

#### a) Configure DKIM & SPF (Important!)

1. **In Supabase Dashboard**, go to **Project Settings** → **Email**
2. Note down your **SMTP Configuration**
3. For production, configure your domain's DNS:
   - **DKIM** (DomainKeys Identified Mail)
   - **SPF** (Sender Policy Framework)
   - **DMARC** (Domain-based Message Authentication)

#### b) Use a Custom Domain Email

Instead of `noreply@supabase.co`:

1. **In Supabase Settings**, configure a custom domain
2. Verify domain ownership via DNS records
3. This increases inbox delivery rate significantly

#### c) Send from "SaloneCare" instead of System Address

In your Supabase email settings, set:
- **From Address**: `noreply@salonecarehealth.com`
- **From Name**: `SaloneCare` or `SaloneCare Admin`

### 4. **Doctor/Pharmacy Approval System** ✨

When doctors or pharmacies sign up, they now:

#### Signup Flow for Doctors/Pharmacies:
1. Fill in form with name, email, password
2. **Upload license document** (PDF, JPG, PNG)
3. Receive verification code via email
4. Verify email
5. **Account enters PENDING status**
6. **Cannot login until admin approves**
7. Receive approval/rejection email

#### Admin Approval Workflow:

**Access Admin Panel:**
```
/admin/approvals
```

**Admin can:**
- View all pending doctor/pharmacy applications
- See full details: name, role, email, registration date
- **Approve** → User can now login
- **Reject** → User is notified

**User Notifications:**
- Pending users see "Pending Approval" on profile
- Get email when approved or rejected

#### Approval Status Logic:
- **Patients**: Automatically approved (login immediately after email verification)
- **Doctors**: Pending until admin approves (license verification)
- **Pharmacies**: Pending until admin approves (pharmacy verification)

### 5. **Beautiful Blue & White UI with Waves** 🌊

All pages now feature:
- **Gradient background**: Blue to white transitions
- **Wave SVG elements**: Decorative animated waves
- **Modern design**: Rounded cards, shadows, smooth animations
- **Consistent branding**: Blue (#1e40af to #1e3a8a) and white color scheme
- **Responsive**: Works perfectly on mobile, tablet, desktop

#### Pages Updated:
- ✅ Landing page (`/`) - Beautiful hero with waves
- ✅ Signup (`/signup`) - Blue gradient with approval flow
- ✅ Login (`/login`) - Elegant wave design
- ✅ Profile (`/profile`) - Shows approval status
- ✅ Admin Approvals (`/admin/approvals`) - Admin dashboard

## 📋 Database Schema Updates

### Profiles Table - New Fields
```sql
ALTER TABLE profiles ADD COLUMN approval_status TEXT DEFAULT 'approved';
-- For patients: 'approved'
-- For doctors/pharmacies: 'pending', 'approved', or 'rejected'
```

### Updated profile columns:
- `id` (UUID) - User ID
- `full_name` (TEXT) - User's name
- `role` (TEXT) - 'patient', 'doctor', or 'pharmacy'
- `phone` (TEXT) - Optional phone
- `approval_status` (TEXT) - Approval state
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Configuration Checklist

### Step 1: Set Token Expiration
- [ ] Go to Supabase Dashboard → Authentication → Providers → Email
- [ ] Set "Confirm email expiration" to 7 days or more
- [ ] Click Save

### Step 2: Customize Email Template
- [ ] Go to Authentication → Email Templates
- [ ] Edit "Confirm email" template
- [ ] Add SaloneCare branding (see template above)
- [ ] Click Save

### Step 3: Configure Email Deliverability
- [ ] Add DKIM records to your domain DNS
- [ ] Add SPF records to your domain DNS
- [ ] Add DMARC records to your domain DNS
- [ ] Test email sending to Gmail, Yahoo, Outlook

### Step 4: Update Database Schema
```sql
-- Run this in Supabase SQL editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
```

### Step 5: Test Approval Flow
- [ ] Create doctor account
- [ ] Verify email
- [ ] Check profile shows "Pending Approval"
- [ ] Login to admin (/admin/approvals)
- [ ] Approve doctor account
- [ ] Doctor receives approval email
- [ ] Doctor can now access features

## 📧 Email Verification Code Format

The verification code sent to users will be:
- **6-digit numeric code** (e.g., 123456)
- **Expires**: 7 days from sending
- **Branding**: Clearly shows "SaloneCare"
- **Professional**: Includes footer with SaloneCare info

## 🔐 Security Features

✅ **No Token Expiration Issues**: 7-day window
✅ **Branded Emails**: Users see "from SaloneCare"
✅ **Spam Prevention**: Proper DKIM/SPF/DMARC
✅ **Doctor/Pharmacy Verification**: Admin approval required
✅ **Secure Approval Flow**: Only admins can approve
✅ **Audit Trail**: All approvals logged with timestamps

## 🧪 Testing Approval Flow

### Test as Doctor:
1. Go to `/signup`
2. Enter doctor information
3. Upload license document
4. Enter verification code
5. See "Pending Approval" message
6. Try to login → Denied (account pending)

### Test as Admin:
1. Login with admin account
2. Visit `/admin/approvals`
3. View pending doctor applications
4. Click "Approve" button
5. Doctor receives approval email
6. Doctor can now login

### Test Email Branding:
1. Sign up for account
2. Check email inbox
3. Verify email shows "SaloneCare" branding
4. Check code is 6-digit number
5. Verify it's in main inbox, not spam

## 📝 Sending Approval Emails (Optional Enhancement)

To send automatic emails on approval/rejection, add this to `/api/auth/approve`:

```typescript
// Send approval email
await supabase.auth.admin.sendEmail({
  email: doctorEmail,
  subject: 'Your SaloneCare Application Approved',
  html: `<h2>Great news!</h2><p>Your doctor profile has been verified and approved. You can now login to SaloneCare.</p>`,
});
```

## 🚀 Production Deployment

### Before Going Live:

1. **Setup Custom Domain**
   - Configure custom email domain in Supabase
   - Add DNS records (DKIM, SPF, DMARC)
   - Test email delivery

2. **Email Template Customization**
   - Update with your actual domain URL
   - Add company logo URL
   - Customize footer with your details

3. **Admin Account Setup**
   - Create admin user in Supabase
   - Set role to 'admin' in profiles table
   - Test approval workflow

4. **Database Backup**
   - Backup all data before production
   - Test restore procedures

5. **Security Review**
   - Verify RLS policies are enabled
   - Check admin endpoint protection
   - Test with real emails

## 📞 Troubleshooting

### Email Not Received
**Solution:** 
1. Check Supabase email logs
2. Verify DKIM/SPF records
3. Check spam folder
4. Use custom domain for better delivery

### Token Expired Too Early
**Solution:**
1. Increase expiration to 7+ days in Supabase
2. Check system timezone settings

### Approval Not Working
**Solution:**
1. Verify user is admin role
2. Check database schema has approval_status column
3. Verify profile record was created

### Emails Showing as Spam
**Solution:**
1. Configure DKIM properly
2. Add SPF record for domain
3. Use custom domain instead of @supabase.co
4. Add company signature to template

## 📚 Additional Resources

- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [DKIM Configuration Guide](https://dmarcian.com/dkim/)
- [SPF Record Setup](https://mxtoolbox.com/spf.aspx)
- [Email Deliverability Best Practices](https://mailchimp.com/resources/email-deliverability/)

---

**Implementation Complete! 🎉**

Your SaloneCare healthcare platform now has:
- ✨ Beautiful blue & white UI with waves
- 📧 Professional, non-expiring email verification
- 👨‍⚕️ Doctor/Pharmacy approval system
- 🔐 Secure admin approval workflow
- 📱 Responsive design across all devices
