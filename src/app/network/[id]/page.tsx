'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Contact, Interaction } from '@/lib/types';

type ContactDetail = Contact & {
  companies: { name: string } | null;
  days_quiet: number | null;
};

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/contacts/${id}`).then((res) => res.json()),
      fetch(`/api/interactions?contact_id=${id}`).then((res) => res.json()),
    ]).then(([contactData, interactionsData]) => {
      setContact(contactData.contact ?? null);
      setInteractions(interactionsData.interactions ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!contact) return <p>Not found</p>;

  const reactivate = contact.days_quiet !== null && contact.days_quiet >= 90;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{contact.name}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {contact.companies?.name ?? 'No company'} {contact.role_title ? `· ${contact.role_title}` : ''} · {contact.status}
        </p>
        {reactivate && (
          <p className="text-sm text-amber-600 mt-1">Reactivation flag - {contact.days_quiet} days quiet</p>
        )}
      </div>

      {contact.notes && (
        <div>
          <h2 className="font-medium mb-1">Notes</h2>
          <pre className="whitespace-pre-wrap text-sm font-sans">{contact.notes}</pre>
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Interactions ({interactions.length})</h2>
        {interactions.map((i) => (
          <div key={i.id} className="border-b py-2 text-sm">
            <p className="font-medium">{i.subject ?? '(no subject)'}</p>
            <p className="text-black/60 dark:text-white/60">
              {i.channel} · {i.direction} · {i.status} {i.intended_send_date ? `· intended ${i.intended_send_date}` : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
