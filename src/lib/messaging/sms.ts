import twilio from 'twilio';

function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

export async function sendSMS(to: string, body: string) {
  const client = getTwilioClient();

  const message = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });

  return {
    sid: message.sid,
    status: message.status,
  };
}
