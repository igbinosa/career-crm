'use client';

import { useEffect, useState } from 'react';
import type { Company } from '@/lib/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'tier_1' | 'tier_2'>('tier_2');
  const [why, setWhy] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data.companies ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), tier, why: why.trim() || null }),
    });
    setName('');
    setWhy('');
    setTier('tier_2');
    load();
  }

  if (loading) return <p>Loading...</p>;

  const tier1 = companies.filter((c) => c.tier === 'tier_1');
  const tier2 = companies.filter((c) => c.tier === 'tier_2');

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <h1 className="text-lg font-medium">Companies</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" className="border rounded px-3 py-2" />
        <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why (optional)" className="border rounded px-3 py-2" />
        <select value={tier} onChange={(e) => setTier(e.target.value as 'tier_1' | 'tier_2')} className="border rounded px-3 py-2">
          <option value="tier_1">Tier 1</option>
          <option value="tier_2">Tier 2</option>
        </select>
        <button type="submit" className="bg-foreground text-background rounded px-3 py-2">Add to watchlist</button>
      </form>

      <div>
        <h2 className="font-medium mb-2">Tier 1</h2>
        {tier1.map((c) => (
          <div key={c.id} className="border-b py-2 text-sm">
            <p className="font-medium">{c.name}</p>
            {c.why && <p className="text-black/60 dark:text-white/60">{c.why}</p>}
            {c.status_note && <p className="text-black/60 dark:text-white/60">{c.status_note}</p>}
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-medium mb-2">Tier 2</h2>
        {tier2.map((c) => (
          <div key={c.id} className="border-b py-2 text-sm">
            <p className="font-medium">{c.name}</p>
            {c.why && <p className="text-black/60 dark:text-white/60">{c.why}</p>}
            {c.status_note && <p className="text-black/60 dark:text-white/60">{c.status_note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
