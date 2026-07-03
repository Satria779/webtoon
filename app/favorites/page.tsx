'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, BookOpen, Trash2, Scan, Bug } from 'lucide-react';
import ShareFavorites from '../components/ShareFavorites';
import ScanQR from '../components/ScanQR';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const loadFavorites = () => {
    const saved = localStorage.getItem('komik2_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = (url: string) => {
    const updated = favorites.filter(item => item.url !== url);
    setFavorites(updated);
    localStorage.setItem('komik2_favorites', JSON.stringify(updated));
  };

  const clearAllFavorites = () => {
    if (confirm('Hapus semua favorit?')) {
      setFavorites([]);
      localStorage.setItem('komik2_favorites', JSON.stringify([]));
    }
  };

  const handleScanResult = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.data && Array.isArray(parsed.data)) {
        const existingUrls = new Set(favorites.map(f => f.url));
        const newFavs = parsed.data.filter((f: any) => !existingUrls.has(f.url));
        const merged = [...favorites, ...newFavs];
        setFavorites(merged);
        localStorage.setItem('komik2_favorites', JSON.stringify(merged));
        alert(`Berhasil menambahkan ${newFavs.length} favorit!`);
        setShowScanner(false);
      }
    } catch (error) {
      alert('QR Code tidak valid!');
    }
  };

  const openBugReport = () => {
    const btn = document.querySelector('button[aria-label="Lapor Bug"]');
    if (btn) {
      (btn as HTMLButtonElement).click();
    } else {
      alert('Fitur Lapor Bug sedang dalam pengembangan. Silakan kirim email ke komik2web@gmail.com');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] pb-24 md:pb-8">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-pink-400" />
          <span className="text-sm font-medium text-white">Favorit</span>
        </div>
        
        <button
          onClick={openBugReport}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition-all duration-300"
        >
          <Bug size={14} />
          <span className="hidden sm:inline">Lapor Bug</span>
        </button>
        
        <span className="text-xs font-mono text-white/20 ml-2">• KOMIK2 •</span>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Heart size={32} className="text-white/20" />
            </div>
            <p className="text-white/40 font-medium">Belum ada favorit</p>
            <p className="text-white/20 text-sm font-mono mt-1">
              Mulai tambahkan komik favoritmu
            </p>
            <Link href="/" className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
              Jelajahi Komik
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-pink-400" fill="currentColor" />
                <span className="text-sm text-white/60">
                  {favorites.length} komik tersimpan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs transition-all duration-300"
                >
                  <Scan size={14} />
                  Scan QR
                </button>

                <ShareFavorites favorites={favorites} />

                <button
                  onClick={clearAllFavorites}
                  className="text-xs text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Hapus Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((item, idx) => (
                <div key={idx} className="group relative">
                  <Link href={`/detail?url=${encodeURIComponent(item.url)}`} className="block rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
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
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                          No Cover
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-xs font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {item.title || 'Unknown Title'}
                      </h3>
                      <p className="text-[10px] text-white/30 font-mono mt-0.5">
                        {item.genre || 'General'}
                      </p>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => removeFavorite(item.url)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white/40 hover:text-red-400 hover:bg-black/90 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Hapus dari favorit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showScanner && (
        <ScanQR
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
