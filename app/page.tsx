'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Flame, Bell, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/trending?day=trending')
      .then(res => res.json())
      .then(data => {
        setTrending(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a0a] to-[#111827] pb-20 md:pb-0">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 pt-safe px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              KOMIK<span className="text-blue-400">2</span>
            </h1>
            <p className="text-[10px] font-mono text-white/40 tracking-widest">• DIGITAL COMICS •</p>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors" aria-label="Notifications">
          <Bell size={20} className="text-white/60 hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0a0a0a]"></span>
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        
        {/* HERO SECTION */}
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border border-white/5 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-2xl">
              Temukan Webtoon <br />
              <span className="text-blue-400">Favoritmu</span>
            </h2>
            <p className="text-white/50 mt-3 max-w-md text-sm">
              Jelajahi ribuan komik digital dari berbagai genre. Update setiap hari.
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl"></div>
            <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all duration-300 overflow-hidden group">
              <Search size={20} className="ml-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari judul webtoon..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="flex-1 bg-transparent text-white font-sans p-4 outline-none placeholder:text-white/30"
              />
              <Link 
                href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Cari
              </Link>
            </div>
          </div>
        </section>

        {/* TRENDING */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Flame className="text-blue-400" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white">Trending Sekarang</h2>
            <span className="text-xs font-mono text-white/30 ml-auto">• LIVE •</span>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : trending.length === 0 ? (
            <div className="p-12 rounded-2xl border border-white/5 bg-white/5 text-center text-white/30">
              <p className="font-mono text-sm">Tidak ada data trending</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trending.slice(0, 10).map((item, idx) => (
                <Link 
                  key={idx} 
                  href={`/detail?url=${encodeURIComponent(item.url)}`}
                  className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="aspect-[2/3] relative bg-gradient-to-b from-white/5 to-transparent">
                    {item.thumbnail ? (
                      <Image 
                        src={`/api/image-proxy?url=${encodeURIComponent(item.thumbnail)}`} 
                        alt={item.title} 
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-xs">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                        {item.genre || 'General'}
                      </span>
                      {item.likes && (
                        <span className="text-[10px] text-blue-400 font-medium">❤️ {item.likes}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
      
      {/* FOOTER */}
      <footer className="mt-12 border-t border-white/5 pt-8 pb-20 md:pb-8 text-center px-6">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-white">KOMIK<span className="text-blue-400">2</span></span>
          </div>
          <p className="text-xs text-white/30 font-mono">Data dari berbagai sumber webtoon</p>
          <div className="flex gap-4 text-xs text-white/20">
            <span>© 2026</span>
            <span>•</span>
            <span>Digital Comics Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
