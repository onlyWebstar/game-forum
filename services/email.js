// services/email.js
//
// Sends mail through Brevo's HTTPS API. Render's free tier blocks the SMTP
// ports (25/465/587), so nodemailer + Gmail SMTP cannot work there.
// Uses the global fetch built into Node 18+, so no extra dependency.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

// FRONTEND_URL may hold several comma-separated URLs; links use the first one
const frontendBase = () =>
  (process.env.FRONTEND_URL || 'http://localhost:8080')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');

const layout = ({ color, title, greeting, intro, buttonText, url, note }) => `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#333;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:${color};color:#fff;padding:28px;text-align:center;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:24px;">${title}</h1>
    </div>
    <div style="background:#f8fafc;padding:28px;">
      <h2 style="margin-top:0;">${greeting}</h2>
      <p>${intro}</p>
      <p style="text-align:center;">
        <a href="${url}" style="display:inline-block;padding:12px 30px;background:${color};color:#fff;text-decoration:none;border-radius:6px;">${buttonText}</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background:#fff;padding:10px;border-radius:5px;word-break:break-all;">${url}</p>
      <p><strong>${note}</strong></p>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;">
      &copy; ${new Date().getFullYear()} NEXUS Gaming Community. This is an automated email, please do not reply.
    </p>
  </div>
</body>
</html>`;

/**
 * Low-level sender. Returns true on success, false on any failure
 * (failures are logged, never thrown).
 */
const sendEmail = async ({ to, toName, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'NEXUS Gaming';

  if (!apiKey || !fromEmail) {
    // Local development without email configured: print the message instead
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `\n[email:dev] BREVO_API_KEY / EMAIL_FROM not set - email NOT sent.\n` +
        `  To: ${to}\n  Subject: ${subject}\n  ${text}\n`
      );
      return true;
    }
    console.error('Email not sent: BREVO_API_KEY and EMAIL_FROM must be set in production');
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
        textContent: text
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Brevo rejected the email to ${to} (${response.status}): ${detail}`);
      return false;
    }

    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
};

// Send verification email
exports.sendVerificationEmail = (user, verificationToken) => {
  const url = `${frontendBase()}/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: user.email,
    toName: user.username,
    subject: 'Verify your email - NEXUS Gaming Community',
    html: layout({
      color: '#6366f1',
      title: '🎮 Welcome to NEXUS!',
      greeting: `Hi ${escapeHtml(user.username)},`,
      intro:
        "Thanks for joining NEXUS Gaming Community! Please verify your email address by clicking the button below:",
      buttonText: 'Verify Email Address',
      url,
      note: 'This link expires in 24 hours. If you did not create an account, you can ignore this email.'
    }),
    text: `Hi ${user.username},\n\nVerify your email address: ${url}\n\nThis link expires in 24 hours.`
  });
};

// Send password reset email
exports.sendPasswordResetEmail = (user, resetToken) => {
  const url = `${frontendBase()}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: user.email,
    toName: user.username,
    subject: 'Password reset request - NEXUS Gaming',
    html: layout({
      color: '#ef4444',
      title: '🔐 Password Reset',
      greeting: `Hi ${escapeHtml(user.username)},`,
      intro:
        'We received a request to reset the password for your NEXUS account. Click the button below to choose a new one:',
      buttonText: 'Reset Password',
      url,
      note: 'This link expires in 1 hour. If you did not request this, you can ignore this email.'
    }),
    text: `Hi ${user.username},\n\nReset your password: ${url}\n\nThis link expires in 1 hour.`
  });
};