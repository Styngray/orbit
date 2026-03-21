import { Resend } from "resend"

// Shared email chrome — wraps any content in the Orbit-branded shell
function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#7c3aed;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:15px;font-weight:700;line-height:32px;">O</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:16px;font-weight:600;color:#18181b;letter-spacing:-0.3px;">Orbit</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e4e4e7;border-radius:10px;padding:36px 36px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Orbit &mdash; project management for modern teams
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  teamName: string,
  inviteUrl: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "Orbit <onboarding@resend.dev>",
    to,
    subject: `${inviterName} invited you to join ${teamName} on Orbit`,
    html: emailLayout(`
      <p style="margin:0 0 6px;font-size:12px;font-weight:500;color:#7c3aed;letter-spacing:0.05em;text-transform:uppercase;">Team invitation</p>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#18181b;letter-spacing:-0.4px;line-height:1.3;">
        You've been invited to ${teamName}
      </h1>
      <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.65;">
        <strong style="color:#3f3f46;">${inviterName}</strong> has invited you to collaborate on <strong style="color:#3f3f46;">${teamName}</strong> inside Orbit. Click below to accept and get started.
      </p>
      <a
        href="${inviteUrl}"
        style="display:inline-block;padding:11px 22px;background:#7c3aed;color:#ffffff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:-0.1px;"
      >Accept invitation</a>
      <hr style="margin:28px 0;border:none;border-top:1px solid #e4e4e7;" />
      <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
        This invitation expires in 7 days. If you weren't expecting this email you can safely ignore it &mdash; no account will be created.
      </p>
    `),
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "Orbit <onboarding@resend.dev>",
    to,
    subject: "Welcome to Orbit",
    html: emailLayout(`
      <p style="margin:0 0 6px;font-size:12px;font-weight:500;color:#7c3aed;letter-spacing:0.05em;text-transform:uppercase;">Welcome aboard</p>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#18181b;letter-spacing:-0.4px;line-height:1.3;">
        Hi ${name}, you're in.
      </h1>
      <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.65;">
        Your Orbit account is ready. Create a team, set up your first workspace, and start tracking work the way your team actually operates.
      </p>
      <a
        href="${process.env.NEXT_PUBLIC_APP_URL}"
        style="display:inline-block;padding:11px 22px;background:#7c3aed;color:#ffffff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:-0.1px;"
      >Open Orbit</a>
      <hr style="margin:28px 0;border:none;border-top:1px solid #e4e4e7;" />
      <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
        You're receiving this because you signed up at orbit. Questions? Reply to this email.
      </p>
    `),
  })
}
