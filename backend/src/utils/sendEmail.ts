import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const getEmailConfig = () => {
  const user = (
    process.env.EMAIL_USER ||
    process.env.EMAIL_ADDRESS ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER
  )?.trim();

  const pass = (
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.GMAIL_PASS
  )?.trim();

  const from = (process.env.EMAIL_FROM || `Event Booking <${user}>`)?.trim();

  return { user, pass, from };
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams) => {
  const { user, pass, from } = getEmailConfig();

  if (!user || !pass || !from) {
    throw new Error('Missing email credentials');
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: to.trim().toLowerCase(),
    subject,
    text,
    html,
  });
};
