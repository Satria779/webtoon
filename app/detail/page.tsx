'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Heart, Clock, Users, BookOpen, ImageOff, RefreshCw, AlertCircle } from 'lucide-react';

function DetailContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [detail, setDetail] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [usingScrape, setUsingScrape] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (!url) return;
    
    if (isRefresh) {
      setIsRefreshing(true);
    }
    
    setScrapeError(null);
    setLoading(true);
    
    try {
      console.log('🔄 Fetching all episodes...');
      const scrapeRes = await fetch(`/api/scrape-all?url=${encodeURIComponent(url)}`);
      const scrapeData = await scrapeRes.json();
      
      if (scrapeData.success && scrapeData.episodes.length > 0) {
        console.log(`✅ Success: ${scrapeData.episodes.length} episodes`);
        setEpisodes(scrapeData.episodes);
        setTotalEpisodes(scrapeData.total);
        setUsingScrape(true);
        setLastUpdated(new Date().toLocaleString('id-ID'));
        
        const detailRes = await fetch(`/api/episodes?url=${encodeURIComponent(url)}&page=1`);
        const detailData = await detailRes.json();
        setDetail(detailData);
        
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      console.log('🔄 Fallback to legacy API...');
      const res = await fetch(`/api/episodes?url=${encodeURIComponent(url)}&page=1`);
      const data = await res.json();
      
      if (data && data.episodesList) {
        setDetail(data);
        setEpisodes(data.episodesList || []);
        setTotalEpisodes(data.count || data.episodesList?.length || 0);
        setUsingScrape(false);
        setLastUpdated(new Date().toLocaleString('id-ID'));
        setScrapeError('Menampilkan episode terbatas.');
      } else {
        throw new Error('No data from legacy API');
      }
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setScrapeError(err.message || 'Gagal memuat data. Coba lagi nanti.');
      setEpisodes([]);
      setTotalEpisodes(0);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!url) return;
    fetchData();
  }, [url]);

  useEffect(() => {
    if (detail) {
      const saved = localStorage.getItem('komik2_favorites');
      if (saved) {
        try {
          const favs = JSON.parse(saved);
          const exists = favs.some((item: any) => item.url === url);
          setIsFavorite(exists);
        } catch {}
      }
    }
  }, [detail, url]);

  const handleRefresh = () => {
    if (!url) return;
    setEpisodes([]);
    fetchData(true);
  };

  const toggleFavorite = () => {
    if (!detail) return;
    
    const saved = localStorage.getItem('komik2_favorites');
    let favs = saved ? JSON.parse(saved) : [];
    
    if (isFavorite) {
      favs = favs.filter((item: any) => item.url !== url);
    } else {
      favs.push({
        url: url,
        title: detail.title,
        thumbnail: detail.thumbnail,
        genre: detail.genre || 'General',
      });
    }
    
    localStorage.setItem('komik2_favorites', JSON.stringify(favs));
    setIsFavorite(!isFavorite);
  };

  const getImageUrl = (thumbnail: string) => {
    if (!thumbnail) return null;
    return `/api/image-proxy?url=${encodeURIComponent(thumbnail)}`;
  };

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
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

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

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-white/40 font-mono text-sm">Gagal memuat data</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="w-48 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 mx-auto md:mx-0 relative">
            {detail.thumbnail ? (
              <>
                <Image 
                  src={getImageUrl(detail.thumbnail) || ''} 
                  alt={detail.title} 
                  fill
                  unoptimized
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                {imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5">
                    <ImageOff size={32} className="text-white/20" />
                    <span className="text-white/20 text-xs mt-2">Gagal muat</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                No Cover
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
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

            <button
              onClick={toggleFavorite}
              className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isFavorite 
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">
                {isFavorite ? 'Favorit' : 'Tambah Favorit'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Daftar Episode</h2>
            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">
              {totalEpisodes || episodes.length}
            </span>
            {usingScrape && (
              <span className="text-[8px] font-mono text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
                ALL
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Update...' : 'Cek Update'}
            </button>
            
            {lastUpdated && (
              <span className="text-[10px] font-mono text-white/20">
                {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {scrapeError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-4">
            <AlertCircle size={16} />
            {scrapeError}
          </div>
        )}

        <div className="space-y-2">
          {episodes.length === 0 ? (
            <div className="p-8 text-center text-white/30">
              <p>Tidak ada episode ditemukan</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Coba Refresh
              </button>
            </div>
          ) : (
            episodes.map((ep: any, idx: number) => (
              <Link 
                key={idx}
                href={`/read?url=${encodeURIComponent(ep.url)}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-16 aspect-video rounded-lg overflow-hidden bg-white/5 relative shrink-0">
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
                  </div>
                </div>
                
                <div className="text-white/20 group-hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {episodes.length > 0 && (
          <div className="text-center text-[10px] font-mono text-white/20 mt-4">
            Menampilkan {episodes.length} episode
            {usingScrape && ' (semua episode)'}
            {!usingScrape && ' (terbaru)'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] pb-24 md:pb-8">
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
