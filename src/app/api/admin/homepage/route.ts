import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Try to refresh token first
    let accessToken = null;
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Fetch homepage data
    const response = await fetch(`${API_BASE_URL}/admin/homepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch homepage data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
