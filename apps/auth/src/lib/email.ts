import nodemailer from 'nodemailer';
import type { SendVerificationRequestParams } from 'next-auth/providers/email';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
  secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: SendVerificationRequestParams) {
  const { host } = new URL(url);
  
  const text = `
Sign in to ${host}

Click the link below to sign in to your account:

${url}

This link expires in 1 hour. If you didn't request this email, you can safely ignore it.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .footer { color: #666; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Sign in to ${host}</h2>
    <p>Click the button below to sign in to your account:</p>
    <a href="${url}" class="button">Sign In</a>
    <p>Or copy this link: <a href="${url}">${url}</a></p>
    <p class="footer">This link expires in 1 hour. If you didn't request this email, you can safely ignore it.</p>
  </div>
</body>
</html>
`;

  await transporter.sendMail({
    from: provider.from,
    to: identifier,
    subject: `Sign in to ${host}`,
    text,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'welcome@example.com',
    to: email,
    subject: 'Welcome!',
    text: `Welcome ${name}! Your account has been created successfully.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome, ${name}!</h2>
    <p>Your account has been created successfully. You can now sign in using any of the connected providers.</p>
  </div>
</body>
</html>
`,
  });
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  inviterName: string,
  acceptUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>You've been invited to join ${organizationName}</h2>
    <p>${inviterName} has invited you to join their organization.</p>
    <a href="${acceptUrl}" class="button">Accept Invitation</a>
    <p>Or copy this link: <a href="${acceptUrl}">${acceptUrl}</a></p>
    <p>This invitation expires in 7 days.</p>
  </div>
</body>
</html>
`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    to: email,
    subject: `You've been invited to join ${organizationName}`,
    html,
  });
}