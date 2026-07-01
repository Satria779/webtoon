'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, ArrowLeft, BookOpen, X } from 'lucide-react';
import Image from 'next/image';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(!!initialQ);

  const fetchResults = (q: string) => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialQ) {
      fetchResults(initialQ);
    }
  }, [initialQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(query.trim()) {
      window.history.replaceState({}, '', `/search?q=${encodeURIComponent(query)}`);
      fetchResults(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    window.history.replaceState({}, '', '/search');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all duration-300 overflow-hidden group">
          <SearchIcon size={20} className="ml-4 text-white/30 group-focus-within:text-blue-400 transition-colors flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Cari judul komik, genre, atau penulis..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white font-sans p-4 outline-none placeholder:text-white/30 min-w-0"
            autoFocus={!initialQ}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-2 text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 flex-shrink-0"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Search Tips */}
      {!initialQ && !results && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <SearchIcon size={32} className="text-white/20" />
          </div>
          <p className="text-white/40 font-medium">Cari komik favoritmu</p>
          <p className="text-white/20 text-sm font-mono mt-1">Masukkan judul, genre, atau penulis</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 animate-pulse">
              <div className="w-20 aspect-[3/4] rounded-lg bg-white/10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 w-3/4 bg-white/10 rounded"></div>
                <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                <div className="h-3 w-1/3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : results ? (
        <div className="space-y-5">
          {/* Results Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              <span className="text-sm text-white/60">
                Hasil untuk "{results.query}"
              </span>
            </div>
            <span className="text-xs font-mono text-white/30 bg-white/5 px-3 py-1 rounded-full">
              {results.count} ditemukan
            </span>
          </div>

          {results.items?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-white/40 font-medium">Tidak ada hasil</p>
              <p className="text-white/20 text-sm font-mono mt-1">Coba gunakan kata kunci lain</p>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-3">
            {results.items?.map((item: any, idx: number) => (
              <Link 
                key={idx}
                href={`/detail?url=${encodeURIComponent(item.url)}`}
                className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                  {item.thumbnail ? (
                    <Image 
                      src={`/api/image-proxy?url=${encodeURIComponent(item.thumbnail)}`} 
                      alt={item.title} 
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex flex-col py-1 flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    {item.author || "Unknown Author"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.section && (
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        {item.section}
                      </span>
                    )}
                    {item.genre && (
                      <span className="text-[10px] font-mono bg-white/5 text-white/40 px-2 py-0.5 rounded">
                        {item.genre}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-white/20 group-hover:text-blue-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link 
          href="/" 
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <SearchIcon size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">Cari</span>
        </div>
        <span className="text-xs font-mono text-white/20 ml-auto">• KOMIK2 •</span>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/30 text-sm mt-4 font-mono">Memuat pencarian...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 flex z-50 h-16">
        <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/40 hover:text-white/80 transition-colors">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/search" className="flex-1 flex flex-col items-center justify-center gap-0.5 text-blue-400">
          <span className="text-lg">🔍</span>
          <span className="text-[10px] font-medium">Cari</span>
        </Link>
        <Link href="/favorites" className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/40 hover:text-white/80 transition-colors">
          <span className="text-lg">❤️</span>
          <span className="text-[10px] font-medium">Favorit</span>
        </Link>
      </nav>
    </div>
  );
}
