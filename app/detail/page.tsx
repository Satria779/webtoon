'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Heart, Clock, Users, BookOpen, ChevronDown } from 'lucide-react';

function DetailContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [detail, setDetail] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetch(`/api/episodes?url=${encodeURIComponent(url)}&page=1`)
      .then(res => res.json())
      .then(data => {
        setDetail(data);
        setEpisodes(data.episodesList || []);
        setHasMore(data.hasNext);
        setPage(1);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [url]);

  const loadMore = () => {
    if (!url || !hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetch(`/api/episodes?url=${encodeURIComponent(url)}&page=${nextPage}`)
      .then(res => res.json())
      .then(data => {
        setEpisodes(prev => [...prev, ...(data.episodesList || [])]);
        setHasMore(data.hasNext);
        setPage(nextPage);
        setLoadingMore(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingMore(false);
      });
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-white/40 font-mono text-sm">URL tidak ditemukan</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-48 aspect-[3/4] rounded-xl bg-white/5 shrink-0 mx-auto md:mx-0"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 bg-white/5 rounded-lg"></div>
            <div className="h-4 w-1/2 bg-white/5 rounded-lg"></div>
            <div className="h-20 w-full bg-white/5 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-white/40 font-mono text-sm">Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER INFO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          <div className="w-48 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 mx-auto md:mx-0">
            {detail.thumbnail ? (
              <Image 
                src={`/api/image-proxy?url=${encodeURIComponent(detail.thumbnail)}`} 
                alt={detail.title} 
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                No Cover
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              {detail.status || 'Ongoing'}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 leading-tight">
              {detail.title}
            </h1>
            <p className="text-white/40 font-mono text-sm mb-4">
              {detail.author || 'Unknown Author'}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 mb-4 justify-center md:justify-start">
              {detail.genre && (
                <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs font-mono">
                  {detail.genre}
                </span>
              )}
              {detail.rating && (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star size={14} fill="currentColor" />
                  {detail.rating}
                </span>
              )}
              {detail.subscribers && (
                <span className="flex items-center gap-1 text-white/40 text-sm">
                  <Users size={14} />
                  {detail.subscribers}
                </span>
              )}
              {detail.day && (
                <span className="flex items-center gap-1 text-blue-400 text-sm">
                  <Clock size={14} />
                  {detail.day}
                </span>
              )}
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-2xl border-l-2 border-blue-500/30 pl-4">
              {detail.synopsis || 'Tidak ada sinopsis tersedia.'}
            </p>
          </div>
        </div>
      </div>

      {/* EPISODE LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Daftar Episode</h2>
          </div>
          <span className="text-xs font-mono text-white/30 bg-white/5 px-3 py-1 rounded-full">
            {detail.count || episodes.length} episode
          </span>
        </div>

        <div className="space-y-2">
          {episodes.map((ep: any, idx: number) => (
            <Link 
              key={idx}
              href={`/read?url=${encodeURIComponent(ep.url)}`}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 relative shrink-0">
                {ep.thumbnail ? (
                  <Image 
                    src={`/api/image-proxy?url=${encodeURIComponent(ep.thumbnail)}`} 
                    alt={ep.title} 
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">
                    No img
                  </div>
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[8px] font-bold">
                  #{ep.episodeNo || idx + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors text-sm">
                  {ep.title || `Episode ${idx + 1}`}
                </h3>
                <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                  {ep.date && <span>{ep.date}</span>}
                  {ep.likes && (
                    <span className="flex items-center gap-1">
                      <Heart size={10} className="text-pink-400" fill="currentColor" />
                      {ep.likes}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-white/20 group-hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <button 
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                Memuat...
              </>
            ) : (
              <>
                <span>Muat Lebih Banyak</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-3 flex items-center gap-4">
        <button 
          onClick={() => window.history.back()} 
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">Detail</span>
        </div>
        <span className="text-xs font-mono text-white/20 ml-auto">• KOMIK2 •</span>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/30 text-sm mt-4 font-mono">Memuat data...</p>
          </div>
        }>
          <DetailContent />
        </Suspense>
      </main>
    </div>
  );
}
