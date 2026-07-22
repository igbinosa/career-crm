'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.push(searchParams.get('next') || '/');
      router.refresh();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64">
      <h1 className="text-lg font-medium text-center">Career CRM</h1>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
        className="border rounded px-3 py-2 text-center tracking-widest"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button type="submit" className="bg-foreground text-background rounded px-3 py-2">
        Unlock
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
