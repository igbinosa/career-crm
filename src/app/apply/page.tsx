'use client';

import { useEffect, useState } from 'react';
import type { Application } from '@/lib/types';

type ApplicationWithCompany = Application & { companies: { name: string } | null };

export default function ApplyPage() {
  const [applications, setApplications] = useState<ApplicationWithCompany[]>([]);
  const [postingUrl, setPostingUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [track, setTrack] = useState<'internship' | 'full_time' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/applications');
    const data = await res.json();
    setApplications(data.applications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() only sets state after its await resolves, not synchronously
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!postingUrl.trim() && !roleTitle.trim()) {
      setError('Paste a posting link or enter a role title');
      return;
    }
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        posting_url: postingUrl.trim() || null,
        company_name: companyName.trim() || null,
        role_title: roleTitle.trim() || 'Unspecified role',
        track: track || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Failed to queue application');
      return;
    }
    setPostingUrl('');
    setCompanyName('');
    setRoleTitle('');
    setTrack('');
    load();
  }

  if (loading) return <p>Loading...</p>;

  const queued = applications.filter((a) => a.stage === 'queued');
  const escalated = applications.filter((a) => a.stage === 'escalated');
  const pendingReview = applications.filter((a) => a.stage === 'pending_review');
  const assessments = applications.filter((a) => a.stage === 'assessment_pending');

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <h1 className="text-lg font-medium">Queue an application</h1>
        <input
          type="url"
          value={postingUrl}
          onChange={(e) => setPostingUrl(e.target.value)}
          placeholder="Posting link"
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company (optional)"
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="Role (optional)"
          className="border rounded px-3 py-2"
        />
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as 'internship' | 'full_time' | '')}
          className="border rounded px-3 py-2"
        >
          <option value="">Track unknown</option>
          <option value="internship">Internship</option>
          <option value="full_time">Full-time</option>
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-foreground text-background rounded px-3 py-2">
          Queue
        </button>
      </form>

      {assessments.length > 0 && (
        <div className="border border-red-500 rounded p-3">
          <h2 className="font-medium text-red-500">Assessment pending</h2>
          {assessments.map((a) => (
            <p key={a.id} className="text-sm">
              {a.companies?.name ?? 'Unknown company'} - {a.role_title} - deadline: {a.assessment_deadline ?? 'unknown'}
            </p>
          ))}
        </div>
      )}

      {escalated.length > 0 && (
        <div className="border rounded p-3">
          <h2 className="font-medium">Escalated - needs your answer</h2>
          {escalated.map((a) => (
            <p key={a.id} className="text-sm">
              {a.companies?.name ?? 'Unknown company'} - {a.role_title}: {a.escalation_note ?? 'see chat session'}
            </p>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Queued ({queued.length})</h2>
        {queued.map((a) => (
          <p key={a.id} className="text-sm">
            {a.companies?.name ?? 'Unknown company'} - {a.role_title} {a.track ? `(${a.track})` : ''}
          </p>
        ))}
      </div>

      {pendingReview.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Pending review (first 3 - runs in chat)</h2>
          {pendingReview.map((a) => (
            <p key={a.id} className="text-sm">
              {a.companies?.name ?? 'Unknown company'} - {a.role_title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
