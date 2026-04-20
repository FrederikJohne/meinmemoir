type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getSendGridConfig() {
  const apiKey = process.env.TWILIO_SENDGRID_API_KEY;
  const fromEmail = process.env.TWILIO_SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const config = getSendGridConfig();
  if (!config) {
    return { sent: false, reason: 'missing_sendgrid_config' as const };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: config.fromEmail },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`SendGrid request failed (${response.status}): ${details}`);
  }

  return { sent: true as const };
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = 'Passwort zuruecksetzen - MeineMemoiren';
  const text = `Hallo,\n\nhier ist dein Link zum Zuruecksetzen deines Passworts:\n${resetLink}\n\nWenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.\n\nViele Gruesse\nMeineMemoiren`;
  const html = `
    <p>Hallo,</p>
    <p>hier ist dein Link zum Zuruecksetzen deines Passworts:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
    <p>Viele Gruesse<br />MeineMemoiren</p>
  `;

  return sendEmail({ to, subject, html, text });
}
