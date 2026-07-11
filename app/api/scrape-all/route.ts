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
    // Extract title_no dari URL
    const titleNoMatch = url.match(/title_no=(\d+)/);
    const titleNo = titleNoMatch ? titleNoMatch[1] : null;
    
    if (!titleNo) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract title_no from URL'
      }, { status: 400 });
    }
    
    console.log('🔄 Fetching all episodes for title_no:', titleNo);
    
    // Ambil SEMUA episode pake API Webtoon
    let allEpisodes: any[] = [];
    let page = 1;
    let hasMore = true;
    let errorCount = 0;
    
    while (hasMore && errorCount < 5) {
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
          if (errorCount >= 5) break;
          page++;
          continue;
        }
        
        const data = await response.json();
        
        if (data.episodeList && data.episodeList.length > 0) {
          const formatted = data.episodeList.map((ep: any) => ({
            title: ep.title || `Episode ${ep.episodeNo}`,
            url: `https://m.webtoons.com/id/action/lookism/ep${ep.episodeNo}/viewer?title_no=${titleNo}&episode_no=${ep.episodeNo}`,
            date: ep.regDate || 'Unknown',
            episodeNo: String(ep.episodeNo),
            thumbnail: ep.thumbnail || ''
          }));
          
          allEpisodes = [...allEpisodes, ...formatted];
          console.log(`✅ Page ${page}: ${formatted.length} episodes`);
          
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
      // FALLBACK: Coba scrape dari HTML
      console.log('🔄 API failed, trying HTML scrape...');
      return await scrapeFromHTML(url);
    }
    
    console.log(`✅ Total episodes found: ${allEpisodes.length}`);
    
    return NextResponse.json({
      success: true,
      total: allEpisodes.length,
      source: url,
      titleNo: titleNo,
      episodes: allEpisodes.reverse()
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    // FALLBACK: Coba scrape dari HTML
    try {
      return await scrapeFromHTML(url);
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to scrape',
        message: error.message || 'Unknown error'
      }, { status: 500 });
    }
  }
}

// Fungsi fallback scrape dari HTML
async function scrapeFromHTML(url: string) {
  console.log('🔄 Fallback: Scraping from HTML...');
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = await response.text();
  const episodes: any[] = [];
  
  // Extract dari __NEXT_DATA__
  const nextDataMatch = html.match(/__NEXT_DATA__\s*=\s*({.*?});/s);
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const props = data.props?.pageProps;
      
      if (props?.episodeList) {
        props.episodeList.forEach((ep: any) => {
          episodes.push({
            title: ep.title || `Episode ${ep.episodeNo}`,
            url: ep.episodeUrl || '',
            date: ep.regDate || 'Unknown',
            episodeNo: String(ep.episodeNo),
            thumbnail: ep.thumbnail || ''
          });
        });
      }
    } catch (e) {
      console.log('❌ Failed to parse __NEXT_DATA__');
    }
  }
  
  // Extract dari titleHomeState
  if (episodes.length === 0) {
    const titleHomeMatch = html.match(/__titleHomeState__\s*=\s*({.*?});/s);
    if (titleHomeMatch) {
      try {
        const data = JSON.parse(titleHomeMatch[1]);
        if (data.dto?.episodeMeta?.totalEpisodeCount) {
          console.log(`✅ Total episodes from titleHomeState: ${data.dto.episodeMeta.totalEpisodeCount}`);
        }
      } catch (e) {}
    }
  }
  
  if (episodes.length === 0) {
    throw new Error('No episodes found in HTML');
  }
  
  return NextResponse.json({
    success: true,
    total: episodes.length,
    source: url,
    episodes: episodes.reverse()
  });
}
