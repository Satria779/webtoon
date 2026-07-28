'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import BugReport from './BugReport';

export default function BottomNav() {
  const pathname = usePathname();
  const [isBugOpen, setIsBugOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const openBugReport = () => {
    setIsBugOpen(true);
  };

  if (pathname === '/read') {
    return null;
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 flex z-50 h-16">
        <Link 
          href="/" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/') ? 'text-blue-400' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[8px] font-medium">Home</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/search') ? 'text-blue-400' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-[8px] font-medium">Cari</span>
        </Link>
        
        <Link 
          href="/favorites" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/favorites') ? 'text-blue-400' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="text-[8px] font-medium">Fav</span>
        </Link>
        
        <button
          onClick={openBugReport}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/40 hover:text-white/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-[8px] font-medium">Bug</span>
        </button>
      </nav>

      <BugReport isOpen={isBugOpen} onClose={() => setIsBugOpen(false)} />
    </>
  );
}
