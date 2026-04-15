import { Resend } from 'resend'

const FROM = 'Verifact <noreply@send.verifact.work>'
const BASE_URL = process.env.BASE_URL || 'https://verifact.work'

const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendPasswordReset(email, name, token) {
  const resend = getResend()
  const resetUrl = `${BASE_URL}/reset-password/${token}`

  if (!resend) {
    // No API key — log link only in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`)
    }
    return { ok: true, dev: true }
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your Verifact password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',-apple-system,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
          <div style="background:#0F172A;padding:28px 32px;">
            <h1 style="color:white;margin:0;font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;">Verifact</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#0F172A;margin:0 0 12px;font-size:1.3rem;font-weight:700;">Reset your password</h2>
            <p style="color:#64748B;line-height:1.6;margin:0 0 28px;">Hi ${name}, we received a request to reset your password. Click the button below to set a new one.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:13px 28px;background:#22C55E;color:white;border-radius:9px;font-weight:600;font-size:0.95rem;text-decoration:none;">Reset Password</a>
            <p style="color:#94A3B8;font-size:0.82rem;margin:24px 0 0;line-height:1.6;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="color:#CBD5E0;font-size:0.78rem;margin:12px 0 0;">Or copy this link: <span style="color:#475569;font-family:monospace;">${resetUrl}</span></p>
          </div>
        </div>
      </body>
      </html>
    `,
  })

  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function sendWelcome(email, name) {
  const resend = getResend()
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Welcome email for ${email}`)
    }
    return { ok: true, dev: true }
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to Verifact',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',-apple-system,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
          <div style="background:#0F172A;padding:28px 32px;">
            <h1 style="color:white;margin:0;font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;">Verifact</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#0F172A;margin:0 0 12px;font-size:1.3rem;font-weight:700;">Welcome, ${name} 👋</h2>
            <p style="color:#64748B;line-height:1.6;margin:0 0 16px;">Your account is ready. You can now upload documents for AI-powered fact verification and receive cryptographic certificates.</p>
            <p style="color:#64748B;line-height:1.6;margin:0 0 28px;">Free accounts get <strong>1 verification per day</strong>.</p>
            <a href="${BASE_URL}/dashboard" style="display:inline-block;padding:13px 28px;background:#22C55E;color:white;border-radius:9px;font-weight:600;font-size:0.95rem;text-decoration:none;">Go to Dashboard</a>
            <p style="color:#94A3B8;font-size:0.82rem;margin:24px 0 0;">Questions? Reply to this email and we'll help.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })

  return { ok: true }
}
