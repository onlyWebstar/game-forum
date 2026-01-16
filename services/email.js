// services/email.js
const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send verification email
exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"NEXUS Gaming" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email - NEXUS Gaming Community',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 Welcome to NEXUS!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.username},</h2>
            <p>Thanks for joining NEXUS Gaming Community! We're excited to have you here.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with NEXUS, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} NEXUS Gaming Community. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"NEXUS Gaming" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Password Reset Request - NEXUS Gaming',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.username},</h2>
            <p>We received a request to reset your password for your NEXUS account.</p>
            <p>Click the button below to reset your password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} NEXUS Gaming Community. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};