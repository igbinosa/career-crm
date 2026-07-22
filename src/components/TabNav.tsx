'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/apply', label: 'Apply' },
  { href: '/applications', label: 'Applications' },
  { href: '/companies', label: 'Companies' },
  { href: '/network', label: 'Network' },
];

export default function TabNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <nav className="border-b flex gap-1 px-6 py-3 max-w-3xl mx-auto w-full">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded text-sm ${
              active ? 'bg-foreground text-background' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
