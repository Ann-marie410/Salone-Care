import nodemailer from 'nodemailer';

const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').trim();
const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const smtpPort = Number(process.env.SMTP_PORT) || 587;

function createTransporter() {
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    requireTLS: true,
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function verifyConnection(): Promise<{ ok: boolean; error: string | null }> {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('[SMTP] ✅ Connected successfully to', smtpHost);
    return { ok: true, error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[SMTP] ❌ Connection FAILED:', msg);
    return { ok: false, error: msg };
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  console.log('[EMAIL] ▶ Attempting to send OTP to', email);

  if (!smtpUser || !smtpPass) {
    const err = 'SMTP_USER and SMTP_PASS must be set in .env.local';
    console.error('[EMAIL] ❌', err);
    throw new Error(err);
  }

  if (smtpUser === 'your_email@gmail.com' || smtpPass === 'your_gmail_app_password') {
    const err = 'SMTP credentials in .env.local are still placeholder values. Replace them with real Gmail credentials.';
    console.error('[EMAIL] ❌', err);
    throw new Error(err);
  }

  if (smtpPass.includes(' ')) {
    const err = 'SMTP_PASS contains spaces. Remove all spaces from the App Password.';
    console.error('[EMAIL] ❌', err);
    throw new Error(err);
  }

  const transporter = createTransporter();

  const conn = await verifyConnection();
  if (!conn.ok) {
    throw new Error(`SMTP connection failed: ${conn.error}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"SaloneCare" <${smtpUser}>`,
      to: email,
      subject: 'SaloneCare Verification Code',
      text: `Welcome to SaloneCare.\n\nYour verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.`,
    });

    console.log('[EMAIL] ✅ Sent successfully to', email);
    console.log('[EMAIL]   Message ID:', info.messageId);
    console.log('[EMAIL]   Response:', info.response);

    if (info.rejected && info.rejected.length > 0) {
      console.error('[EMAIL] ❌ Recipient rejected:', info.rejected);
      throw new Error(`Email rejected by server: ${info.rejected.join(', ')}`);
    }

    if (info.accepted && info.accepted.length > 0) {
      console.log('[EMAIL]   Accepted by:', info.accepted.join(', '));
    }

    return info;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[EMAIL] ❌ Send failed:', msg);
    throw error;
  }
}
