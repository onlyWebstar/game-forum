// services/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'NEXUS Gaming <onboarding@resend.dev>', // use this until you add a domain
      to: user.email,
      subject: 'Verify Your Email - NEXUS Gaming Community',
      html: `
        <h2>Hi ${user.username},</h2>
        <p>Thanks for joining NEXUS! Please verify your email:</p>
        <a href="${verificationUrl}" style="padding:12px 30px;background:#6366f1;color:white;text-decoration:none;border-radius:5px;">
          Verify Email Address
        </a>
        <p>Link expires in 24 hours.</p>
      `
    });
    console.log('Verification email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: 'NEXUS Gaming <onboarding@resend.dev>',
      to: user.email,
      subject: 'Password Reset Request - NEXUS Gaming',
      html: `
        <h2>Hi ${user.username},</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" style="padding:12px 30px;background:#ef4444;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>Link expires in 1 hour.</p>
      `
    });
    console.log('Password reset email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};