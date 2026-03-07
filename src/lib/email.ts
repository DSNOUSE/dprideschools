import nodemailer from 'nodemailer';

type EmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost'}`;

  if (!host || !port || !user || !pass) {
    // Fallback: log message in development when SMTP not configured
    console.warn('SMTP not configured. Skipping sendEmail.');
    console.info({ to, subject, text, html });
    return { accepted: [to] };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
}
