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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ clerkId: userId });
    if (!user?.googleTokens?.accessToken) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    // Set up OAuth client with user tokens
    oauth2Client.setCredentials({
      access_token: user.googleTokens.accessToken,
      refresh_token: user.googleTokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get events from the past week to next month
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 7);
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 1);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      location: event.location,
      attendees: event.attendees?.map(a => a.email) || [],
    })) || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' }, 
      { status: 500 }
    );
  }
}
