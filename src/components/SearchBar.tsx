'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set('q', value.trim());
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search posts..."
        className="input-field"
      />
      <button type="submit" className="btn-primary whitespace-nowrap" disabled={isPending}>
        {isPending ? '...' : '🔍 Search'}
      </button>
    </form>
  );
}
