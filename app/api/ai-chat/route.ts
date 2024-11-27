import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const response = await fetch(
      `https://server.ai-labhelper.com/api/chat?session_id=666288c3bbdeec47501c57e2&message=${encodeURIComponent(message)}&thread_id=conversacion1`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from AI server' },
      { status: 500 }
    );
  }
}