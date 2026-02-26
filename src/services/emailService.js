import nodemailer from 'nodemailer';

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

const buildEmailBody = (link, name = '') => {
  const safeName = name || 'viajante';
  return {
    subject: 'Recuperação de senha - Reino dos Contos',
    text: `Olá, ${safeName}!\n\nRecebemos um pedido para redefinir sua senha. Use o link abaixo dentro de 30 minutos:\n${link}\n\nSe você não solicitou, ignore este aviso.`,
    html: `<div style="font-family: Georgia, serif; color: #2d0c07; background: linear-gradient(180deg, #fff5e6, #f8e8d2); padding: 18px 16px; border: 1px solid #f0c689; border-radius: 10px;">\n      <h2 style="margin: 0 0 12px; color: #b53a1c;">Chamado do seu grimório</h2>\n      <p style="margin: 0 0 12px;">Olá, <strong>${safeName}</strong>! Recebemos um pedido para redefinir sua senha.</p>\n      <p style="margin: 0 0 14px;">Use o portal abaixo em até <strong>30 minutos</strong> para criar sua nova senha:</p>\n      <p style="margin: 0 0 18px;"><a href="${link}" style="background: #b53a1c; color: #fff7ec; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-weight: 700;">Abrir portal de redefinição</a></p>\n      <p style="margin: 0; color: #5c3b2a;">Se você não solicitou, ignore este aviso.</p>\n    </div>`
  };
};

export const sendPasswordResetEmail = async (to, link, name = '') => {
  const transporter = buildTransporter();
  const from = process.env.MAIL_FROM || 'Reino dos Contos <no-reply@meusite.com>';
  const { subject, text, html } = buildEmailBody(link, name);

  if (!transporter) {
    console.warn('SMTP not configured. Skipping real email send.', { to, link });
    return;
  }

  await transporter.sendMail({ from, to, subject, text, html });
};

export default {
  sendPasswordResetEmail
};
