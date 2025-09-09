import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models/User';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Remove Google tokens from user profile
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $unset: { googleTokens: 1 },
        $set: { 'preferences.googleCalendarSync': false }
      }
    );

    return NextResponse.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' }, 
      { status: 500 }
    );
  }
}
