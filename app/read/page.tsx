'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

function ReadContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetch(`/api/read?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <p className="text-white/40 font-mono text-sm">URL episode tidak ditemukan</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/60 font-medium">Memuat komik...</p>
          <p className="text-white/20 text-xs font-mono">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <BookOpen size={32} className="text-white/20" />
        </div>
        <p className="text-white/40 font-medium">Tidak ada gambar tersedia</p>
        <p className="text-white/20 text-xs font-mono mt-2 max-w-sm">
          Episode ini mungkin memerlukan login atau tidak tersedia untuk umum
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#0a0a0a] min-h-screen">
      {/* Reading Progress Bar */}
      <div className="sticky top-0 z-40 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">
          Halaman {currentPage + 1} / {images.length}
        </span>
        <div className="flex-1 mx-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage + 1) / images.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-white/30 font-mono">
          {Math.round(((currentPage + 1) / images.length) * 100)}%
        </span>
      </div>

      {/* Images Container - TANPA PADDING BOTTOM */}
      <div className="w-full max-w-2xl">
        {images.map((img, idx) => (
          <div key={idx} className="relative">
            <img 
              src={`/api/image-proxy?url=${encodeURIComponent(img)}`} 
              alt={`Halaman ${idx + 1}`}
              className="w-full h-auto block"
              loading="lazy"
              onLoad={() => {
                const rect = document.getElementById(`page-${idx}`)?.getBoundingClientRect();
                if (rect && rect.top >= 0 && rect.top < window.innerHeight) {
                  setCurrentPage(idx);
                }
              }}
              id={`page-${idx}`}
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white/40 text-[10px] font-mono backdrop-blur-sm">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 shadow-2xl">
        <button 
          onClick={scrollToTop}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          aria-label="Ke atas"
        >
          <ArrowUpCircle size={20} />
        </button>
        <div className="w-px h-6 bg-white/10"></div>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors"
        >
          Awal
        </button>
        <button 
          onClick={scrollToBottom}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors"
        >
          Akhir
        </button>
        <div className="w-px h-6 bg-white/10"></div>
        <button 
          onClick={scrollToTop}
          className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-blue-400"
          aria-label="Ke atas"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 z-50"
          aria-label="Scroll ke atas"
        >
          <ArrowUpCircle size={24} />
        </button>
      )}
    </div>
  );
}

export default function ReadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={() => window.history.back()} 
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">Baca Komik</span>
        </div>
        <span className="text-xs font-mono text-white/20 ml-auto">• KOMIK2 •</span>
      </header>
      
      <main className="flex-1 w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/30 text-sm font-mono">Memuat viewer...</p>
          </div>
        }>
          <ReadContent />
        </Suspense>
      </main>
    </div>
  );
}
