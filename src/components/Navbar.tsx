'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(data);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchUser());
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const roleBadge = user?.role === 'admin'
    ? 'badge-admin' : user?.role === 'author'
    ? 'badge-author' : 'badge-viewer';

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <span className="text-2xl">✍️</span> HivonBlog
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium hover:text-blue-600 ${pathname === '/' ? 'text-blue-600' : 'text-gray-600'}`}>
              Blog
            </Link>
            {user && (
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Admin
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className={roleBadge}>{user.role}</span>
                <span className="text-sm text-gray-600 hidden md:block">{user.name}</span>
                <button onClick={handleSignOut} className="btn-secondary text-sm py-1.5">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-1.5">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
