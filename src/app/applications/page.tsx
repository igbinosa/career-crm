'use client';

import { useEffect, useState } from 'react';
import type { Application } from '@/lib/types';

type ApplicationWithCompany = Application & { companies: { name: string } | null };

const STAGES = [
  'queued', 'response_drafted', 'pending_review', 'escalated', 'assessment_pending',
  'applied', 'messaged', 'responded', 'interviewing', 'closed', 'failed',
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithCompany[]>([]);
  const [stageFilter, setStageFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = stageFilter ? `/api/applications?stage=${stageFilter}` : '/api/applications';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications ?? []);
        setLoading(false);
      });
  }, [stageFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium">Applications</h1>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm ml-auto"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Company</th>
              <th className="py-1">Role</th>
              <th className="py-1">Stage</th>
              <th className="py-1">Track</th>
              <th className="py-1">Source</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="py-1">{a.companies?.name ?? '-'}</td>
                <td className="py-1">{a.role_title}</td>
                <td className="py-1">{a.stage}</td>
                <td className="py-1">{a.track ?? '-'}</td>
                <td className="py-1">{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
