import DashboardClient from './DashboardClient';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type User = {
  name: string;
  email: string;
};

type Centre = {
  id: string;
  name: string;
  edition: string;
  exam: string;
};

async function getUser(cookie: string | null): Promise<User | null> {
  if (!cookie) return null;

  const res = await fetch('http://localhost:5000/api/auth/session', {
    headers: { cookie },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.user;
}

async function getCentres(cookie: string | null): Promise<Centre[]> {
  const res = await fetch('http://localhost:5000/api/centres', {
    headers: { cookie: cookie ?? '' },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.centres;
}

export default async function DashboardPage() {
  const cookie = (await headers()).get('cookie');
  const user = await getUser(cookie);

  if (!user) {
    redirect('/login');
  }

  const centres = await getCentres(cookie);

  return <DashboardClient user={user} centres={centres} />;
}
