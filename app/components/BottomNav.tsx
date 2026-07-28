'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Search, Heart, Bug, BookOpen, Flame, Bell, Star, Clock, Users, ArrowLeft, RefreshCw, AlertCircle, X, Send, Mail, CheckCircle, ImageOff, ChevronDown, Menu } from 'lucide-react';
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

  // Sembunyikan di halaman read
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
          <Home size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/search') ? 'text-blue-400' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Search size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Cari</span>
        </Link>
        
        <Link 
          href="/favorites" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/favorites') ? 'text-blue-400' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Heart size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Favorit</span>
        </Link>
        
        <button
          onClick={openBugReport}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/40 hover:text-white/80 transition-colors"
        >
          <Bug size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Lapor</span>
        </button>
      </nav>

      <BugReport isOpen={isBugOpen} onClose={() => setIsBugOpen(false)} />
    </>
  );
}
