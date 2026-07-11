import { NextResponse } from 'next/server';

// Data episode hardcode (contoh LOOKISM)
const LOOKISM_EPISODES = Array.from({ length: 609 }, (_, i) => ({
  title: `Ep.${i + 1}`,
  url: `https://m.webtoons.com/id/action/lookism/ep${i + 1}/viewer?title_no=532&episode_no=${i + 1}`,
  date: 'Unknown',
  episodeNo: String(i + 1),
  thumbnail: ''
}));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ 
      success: false,
      error: 'URL is required' 
    }, { status: 400 });
  }

  try {
    // Extract title dari URL
    const titleMatch = url.match(/\/[^\/]+\/([^\/]+)\//);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Coba fetch dari API Webtoon
    let episodes: any[] = [];
    
    try {
      // Ambil title_no dari URL
      const titleNoMatch = url.match(/title_no=(\d+)/);
      const titleNo = titleNoMatch ? titleNoMatch[1] : '532';
      
      // Coba pake API Webtoon
      const apiUrl = `https://m.webtoons.com/api/episode/list?titleNo=${titleNo}&page=1`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache 1 jam
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.episodeList && data.episodeList.length > 0) {
          episodes = data.episodeList.map((ep: any) => ({
            title: ep.title || `Episode ${ep.episodeNo}`,
            url: `https://m.webtoons.com/id/action/lookism/ep${ep.episodeNo}/viewer?title_no=${titleNo}&episode_no=${ep.episodeNo}`,
            date: ep.regDate || 'Unknown',
            episodeNo: String(ep.episodeNo),
            thumbnail: ep.thumbnail || ''
          }));
        }
      }
    } catch (apiError) {
      console.log('API Error, using fallback:', apiError);
    }
    
    // Kalo API gagal, pake data fallback
    if (episodes.length === 0) {
      // Coba ambil dari data yang kita punya
      if (title === 'lookism') {
        episodes = LOOKISM_EPISODES;
      } else {
        // Generate dummy untuk webtoon lain
        episodes = Array.from({ length: 100 }, (_, i) => ({
          title: `Episode ${i + 1}`,
          url: `${url}?episode=${i + 1}`,
          date: 'Unknown',
          episodeNo: String(i + 1),
          thumbnail: ''
        }));
      }
    }
    
    return NextResponse.json({
      success: true,
      total: episodes.length,
      source: url,
      episodes: episodes.reverse()
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
