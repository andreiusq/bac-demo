import { NextRequest, NextResponse } from 'next/server';

export async function generateStaticParams() {
  return [];
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `http://localhost:3000/api/${path}`;
  
  const res = await fetch(url, {
    headers: request.headers,
    credentials: 'include',
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `http://localhost:3000/api/${path}`;
  const body = await request.json();
  
  const res = await fetch(url, {
    method: 'POST',
    headers: request.headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `http://localhost:3000/api/${path}`;
  const body = await request.json();
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: request.headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `http://localhost:3000/api/${path}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: request.headers,
    credentials: 'include',
  });
  
  const data = await res.json();
  return NextResponse.json(data);
} 