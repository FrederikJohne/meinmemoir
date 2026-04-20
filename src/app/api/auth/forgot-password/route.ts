import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendPasswordResetEmail } from '@/lib/messaging/email';

type ForgotPasswordBody = {
  email?: string;
};

function jsonMessage() {
  return NextResponse.json({
    message:
      'Wenn ein Konto existiert, wurde eine Nachricht zum Zuruecksetzen versendet.',
  });
}

export async function POST(request: Request) {
  let body: ForgotPasswordBody;
  try {
    body = await request.json();
  } catch {
    return jsonMessage();
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return jsonMessage();
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const redirectTo = `${appUrl}/reset-password`;

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (error) {
      console.error('Failed to create password reset link:', error);
      return jsonMessage();
    }

    const actionLink = data.properties?.action_link;
    if (!actionLink) {
      console.error('Password reset link missing in Supabase response');
      return jsonMessage();
    }

    const emailResult = await sendPasswordResetEmail(email, actionLink);
    if (!emailResult.sent) {
      console.error(
        `Password reset email not sent: ${emailResult.reason} for ${email}`
      );
    }
  } catch (error) {
    console.error('Forgot password request failed:', error);
  }

  return jsonMessage();
}
