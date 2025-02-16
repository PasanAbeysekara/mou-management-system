import nodemailer from 'nodemailer';

export async function sendApprovalEmail(to: string, subject: string, html: string) {
  // Create a transporter using SMTP credentials from environment variables.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465", // true for port 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    html,
  });
  
  console.log("Email sent: %s", info.messageId);
}
