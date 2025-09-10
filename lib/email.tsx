import { Resend } from "resend"
import type { StudyBlock, Profile } from "./types"
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendReminderEmailProps {
  user: Profile
  studyBlock: StudyBlock
}

export async function sendReminderEmail({ user, studyBlock }: SendReminderEmailProps) {
  const startTime = format(new Date(studyBlock.start_time), "h:mm a")
  const date = format(new Date(studyBlock.start_time), "EEEE, MMMM d, yyyy")

  const fromEmail = process.env.EMAIL_FROM || "Quiet Hours <onboarding@resend.dev>"
  const isUsingTestingDomain = fromEmail.includes("onboarding@resend.dev")
  const recipientEmail = isUsingTestingDomain ? process.env.RESEND_VERIFIED_EMAIL || user.email : user.email

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `Reminder: "${studyBlock.title}" starts in 10 minutes`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Study Block Reminder</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
              }
              .container {
                background: white;
                border-radius: 8px;
                padding: 32px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 32px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 8px;
              }
              .title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
              }
              .time-info {
                background: #eff6ff;
                border: 1px solid #dbeafe;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
              }
              .time-label {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 4px;
              }
              .time-value {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
              }
              .description {
                background: #f9fafb;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                color: #4b5563;
              }
              .cta {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
              }
              .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              ${
                isUsingTestingDomain
                  ? `
              .testing-notice {
                background: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                padding: 12px;
                margin: 16px 0;
                color: #92400e;
                font-size: 14px;
                text-align: center;
              }
              `
                  : ""
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">📚 Quiet Hours</div>
                <div class="title">Your study session starts soon!</div>
              </div>

              ${
                isUsingTestingDomain
                  ? `
              <div class="testing-notice">
                <strong>Testing Mode:</strong> This email was sent to your verified address for testing purposes.
              </div>
              `
                  : ""
              }

              <p>Hi ${user.full_name || "there"},</p>
              
              <p>This is a friendly reminder that your study block "<strong>${studyBlock.title}</strong>" is starting in 10 minutes.</p>

              <div class="time-info">
                <div class="time-label">Session Time</div>
                <div class="time-value">${startTime} on ${date}</div>
              </div>

              ${
                studyBlock.description
                  ? `
                <div class="description">
                  <strong>Notes:</strong><br>
                  ${studyBlock.description}
                </div>
              `
                  : ""
              }

              <div class="cta">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  View Dashboard
                </a>
              </div>

              <p>Time to focus! Find a quiet space, silence your notifications, and make the most of your dedicated study time.</p>

              <div class="footer">
                <p>You're receiving this because you scheduled this study block in Quiet Hours.</p>
                <p>Manage your study schedule at <a href="${process.env.NEXT_PUBLIC_APP_URL}">quiethours.app</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${user.full_name || "there"},

Your study block "${studyBlock.title}" is starting in 10 minutes at ${startTime} on ${date}.

${studyBlock.description ? `Notes: ${studyBlock.description}` : ""}

Time to focus! Find a quiet space, silence your notifications, and make the most of your dedicated study time.

View your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

---
Quiet Hours - Your focused study companion
      `.trim(),
    })

    if (error) {
      console.error("Failed to send email:", error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

export async function sendConfirmationEmail({ user, studyBlock }: SendReminderEmailProps) {
  const startTime = format(new Date(studyBlock.start_time), "h:mm a")
  const endTime = format(new Date(studyBlock.end_time), "h:mm a")
  const date = format(new Date(studyBlock.start_time), "EEEE, MMMM d, yyyy")

  const fromEmail = process.env.EMAIL_FROM || "Quiet Hours <onboarding@resend.dev>"
  const isUsingTestingDomain = fromEmail.includes("onboarding@resend.dev")
  const recipientEmail = isUsingTestingDomain ? process.env.RESEND_VERIFIED_EMAIL || user.email : user.email

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `Study block "${studyBlock.title}" scheduled`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Study Block Confirmed</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
              }
              .container {
                background: white;
                border-radius: 8px;
                padding: 32px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 32px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #10b981;
                margin-bottom: 8px;
              }
              .title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 16px;
              }
              .success-badge {
                background: #d1fae5;
                color: #065f46;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                display: inline-block;
                margin-bottom: 20px;
              }
              .session-details {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .detail-label {
                color: #6b7280;
                font-weight: 500;
              }
              .detail-value {
                color: #1f2937;
                font-weight: 600;
              }
              .reminder-info {
                background: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                color: #92400e;
              }
              .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              ${
                isUsingTestingDomain
                  ? `
              .testing-notice {
                background: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                padding: 12px;
                margin: 16px 0;
                color: #92400e;
                font-size: 14px;
                text-align: center;
              }
              `
                  : ""
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">✅ Quiet Hours</div>
                <div class="success-badge">Study Block Scheduled</div>
                <div class="title">Your focus session is confirmed!</div>
              </div>

              ${
                isUsingTestingDomain
                  ? `
              <div class="testing-notice">
                <strong>Testing Mode:</strong> This email was sent to your verified address for testing purposes.
              </div>
              `
                  : ""
              }

              <p>Hi ${user.full_name || "there"},</p>
              
              <p>Great! Your study block has been successfully scheduled. Here are the details:</p>

              <div class="session-details">
                <div class="detail-row">
                  <span class="detail-label">Session:</span>
                  <span class="detail-value">${studyBlock.title}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${startTime} - ${endTime}</span>
                </div>
                ${
                  studyBlock.description
                    ? `
                  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #bae6fd;">
                    <div class="detail-label" style="margin-bottom: 8px;">Notes:</div>
                    <div style="color: #1f2937;">${studyBlock.description}</div>
                  </div>
                `
                    : ""
                }
              </div>

              <div class="reminder-info">
                <strong>📧 Reminder Set:</strong> You'll receive an email notification 10 minutes before your session starts.
              </div>

              <p>We're excited to help you stay focused and productive. Make sure to prepare your study materials and find a quiet space for maximum concentration.</p>

              <div class="footer">
                <p>Manage your study schedule at <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">your dashboard</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Failed to send confirmation email:", error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Confirmation email error:", error)
    throw error
  }
}
