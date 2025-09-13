# Quiet Hours Scheduler

A full-stack web application for scheduling silent study time blocks with automated email notifications. Built with Next.js, Supabase, and Resend.

## Features

- **User Authentication**: Secure signup/login with email verification
- **Study Block Management**: Create, edit, and delete study sessions
- **Smart Notifications**: Automated email reminders 5-15 minutes before sessions
- **Overlap Prevention**: Prevents conflicting study blocks for users
- **Admin Dashboard**: Monitor notifications and test email system
- **Responsive Design**: Works on desktop and mobile devices
- **Row-Level Security**: Data protection with Supabase RLS policies

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **Deployment**: Vercel
- **UI Components**: shadcn/ui

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Resend account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd quiet-hours-scheduler
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   
   # For testing with Resend's default domain
   RESEND_VERIFIED_EMAIL=your_verified_email@example.com
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
   
   # CRON Security
   CRON_SECRET=your_random_secret_string
   \`\`\`

3. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `scripts/01-setup-database.sql`

4. **Configure authentication**
   - In Supabase dashboard: Authentication → Settings
   - Set Site URL: `http://localhost:3000`
   - Add redirect URL: `http://localhost:3000/auth/callback`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

### For Users

1. **Sign Up**: Create an account at `/auth/signup`
2. **Verify Email**: Check your email and click the verification link
3. **Create Study Blocks**: 
   - Go to dashboard
   - Click "Create Study Block"
   - Fill in title, date, start/end times
   - Add optional description
4. **Receive Notifications**: Get email reminders 5-15 minutes before your study sessions

### For Admins

1. **Monitor System**: Visit `/admin` to view notification logs
2. **Test Emails**: Use the test form to verify email functionality
3. **View Statistics**: Check notification counts and system health

## Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set Environment Variables** in Vercel dashboard
4. **Deploy**

### CRON Jobs

The app uses Vercel Cron Jobs to send notifications:
- **Hobby Plan**: Runs every 10 minutes (limited by Vercel)
- **Pro Plan**: Can run every minute for more precise timing

### Email Configuration

**For Testing (Development):**
- Use `onboarding@resend.dev` as EMAIL_FROM
- Set RESEND_VERIFIED_EMAIL to your verified email
- Emails will only be sent to your verified address

**For Production:**
- Verify a custom domain in Resend
- Set EMAIL_FROM to `noreply@yourdomain.com`
- Remove RESEND_VERIFIED_EMAIL variable

## Database Schema

### Tables

- **profiles**: User profiles (extends auth.users)
- **study_blocks**: Study session data with user relationships
- **email_notifications**: Tracking sent notifications

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on signup

## API Endpoints

- `POST /api/send-notifications` - CRON endpoint for sending emails
- `POST /api/test-email` - Admin endpoint for testing emails
- Authentication handled by Supabase Auth

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `EMAIL_FROM` | Sender email address | Yes |
| `RESEND_VERIFIED_EMAIL` | For testing with default domain | Development |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects | Yes |
| `CRON_SECRET` | Security for CRON endpoints | Yes |

## Troubleshooting

### Email Issues
- Verify RESEND_API_KEY is correct
- Check EMAIL_FROM domain is verified in Resend
- For testing, ensure RESEND_VERIFIED_EMAIL matches your Resend account

### Database Issues
- Ensure SQL setup script ran successfully
- Check RLS policies are enabled
- Verify user permissions in Supabase

### CRON Issues
- Check Vercel function logs
- Verify CRON_SECRET is set
- Ensure vercel.json is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

