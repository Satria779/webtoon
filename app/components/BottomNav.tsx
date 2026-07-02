'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import BugReport from './BugReport';

export default function BottomNav() {
  const pathname = usePathname();
  const [isBugOpen, setIsBugOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-400' : 'text-white/40 hover:text-white/80 transition-colors';
  };

  const openBugReport = () => {
    setIsBugOpen(true);
  };

  // ❌ SEMBUNYIKAN NAVIGASI DI HALAMAN READ
  if (pathname === '/read') {
    return null;
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 flex z-50 h-16">
        <Link href="/" className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive('/')}`}>
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link href="/search" className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive('/search')}`}>
          <span className="text-lg">🔍</span>
          <span className="text-[10px] font-medium">Cari</span>
        </Link>
        
        <Link href="/favorites" className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive('/favorites')}`}>
          <span className="text-lg">❤️</span>
          <span className="text-[10px] font-medium">Favorit</span>
        </Link>
        
        <button
          onClick={openBugReport}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/40 hover:text-white/80 transition-colors"
        >
          <span className="text-lg">🐞</span>
          <span className="text-[10px] font-medium">Lapor</span>
        </button>
      </nav>

      <BugReport isOpen={isBugOpen} onClose={() => setIsBugOpen(false)} />
    </>
  );
}
