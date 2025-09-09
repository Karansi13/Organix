import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models/User';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/dashboard/calendar?error=${error}`, req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=no_code', req.url));
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to user profile
    await connectToDatabase();
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          googleTokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
          },
          'preferences.googleCalendarSync': true
        }
      },
      { upsert: true }
    );

    return NextResponse.redirect(new URL('/dashboard/calendar?success=connected', req.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/calendar?error=auth_failed', req.url));
  }
}
