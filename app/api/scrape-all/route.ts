import { NextResponse } from 'next/server';

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
    // Extract titleNo dari URL
    // Contoh: https://m.webtoons.com/id/action/lookism/list?title_no=532
    const titleNoMatch = url.match(/title_no=(\d+)/);
    const titleNo = titleNoMatch ? titleNoMatch[1] : null;
    
    if (!titleNo) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract title_no from URL'
      }, { status: 400 });
    }
    
    console.log('🔄 Fetching all episodes for title_no:', titleNo);
    
    // Ambil SEMUA episode pake API internal Webtoon
    let allEpisodes: any[] = [];
    let page = 1;
    let hasMore = true;
    let errorCount = 0;
    
    while (hasMore && errorCount < 3) {
      const apiUrl = `https://m.webtoons.com/api/episode/list?titleNo=${titleNo}&page=${page}`;
      console.log(`🔄 Fetching page ${page}...`);
      
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://m.webtoons.com/'
          }
        });
        
        if (!response.ok) {
          console.error(`❌ Failed to fetch page ${page}: ${response.status}`);
          errorCount++;
          if (errorCount >= 3) break;
          page++;
          continue;
        }
        
        const data = await response.json();
        
        if (data.episodeList && data.episodeList.length > 0) {
          // Format episode
          const formatted = data.episodeList.map((ep: any) => ({
            title: ep.title || `Episode ${ep.episodeNo}`,
            url: `https://m.webtoons.com/id/action/lookism/ep${ep.episodeNo}/viewer?title_no=${titleNo}&episode_no=${ep.episodeNo}`,
            date: ep.regDate || ep.regdate || 'Unknown',
            episodeNo: String(ep.episodeNo),
            thumbnail: ep.thumbnail || '',
            isNew: ep.isNew || false
          }));
          
          allEpisodes = [...allEpisodes, ...formatted];
          console.log(`✅ Page ${page}: ${formatted.length} episodes`);
          
          // Cek kalo udah ga ada next page
          if (!data.hasNext) {
            hasMore = false;
            console.log('📌 No more pages');
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (err) {
        console.error(`❌ Error on page ${page}:`, err);
        errorCount++;
        page++;
      }
      
      // Delay biar gak kena rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (allEpisodes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No episodes found',
        message: 'Could not fetch any episodes from Webtoon API'
      }, { status: 404 });
    }
    
    console.log(`✅ Total episodes found: ${allEpisodes.length}`);
    
    // Balikin semua episode (urutan dari yang paling awal)
    return NextResponse.json({
      success: true,
      total: allEpisodes.length,
      source: url,
      titleNo: titleNo,
      episodes: allEpisodes.reverse() // Episode 1 di atas
    });
    
  } catch (error: any) {
    console.error('❌ Scraping error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
        }
