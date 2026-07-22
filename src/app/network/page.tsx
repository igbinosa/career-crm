'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Contact } from '@/lib/types';

type ContactWithCompany = Contact & { companies: { name: string } | null };

export default function NetworkPage() {
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-medium mb-2">Network</h1>
      {contacts.map((c) => (
        <Link
          key={c.id}
          href={`/network/${c.id}`}
          className="border-b py-2 text-sm flex justify-between hover:bg-black/5 dark:hover:bg-white/10 px-1 rounded"
        >
          <span>{c.name}</span>
          <span className="text-black/60 dark:text-white/60">{c.companies?.name ?? '-'} · {c.status}</span>
        </Link>
      ))}
    </div>
  );
}
