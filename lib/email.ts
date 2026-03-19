import { Resend } from "resend"

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "Orbit <hello@yourdomain.com>",
    to,
    subject: "Welcome to Orbit",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">
          Welcome to Orbit, ${name}!
        </h1>
        <p style="color: #555; line-height: 1.6;">
          Your account is ready. Get started by creating your team and first workspace.
        </p>
        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}"
          style="
            display: inline-block;
            margin-top: 24px;
            padding: 12px 24px;
            background: #18181b;
            color: #fff;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
          "
        >
          Open Orbit
        </a>
      </div>
    `,
  })
}
