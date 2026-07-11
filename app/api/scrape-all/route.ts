import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
    console.log('🔄 Scraping URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const episodes: any[] = [];
    
    // Selector untuk berbagai versi webtoon
    const selectors = [
      '.episode-item',
      '._episodeItem',
      '.lst_episode li',
      '.episode_list li',
      '.viewer_episode li',
      '.episode_item',
      '.episode-list-item',
      '.episode_list .item'
    ];
    
    let found = false;
    
    // Coba semua selector
    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        console.log(`✅ Found ${items.length} episodes with selector: ${selector}`);
        
        items.each((i, el) => {
          const title = $(el).find('.title, ._title, .subj, .tx, .episode-title').text().trim();
          const link = $(el).find('a').attr('href');
          const date = $(el).find('.date, ._date, .day, .dday, .reg-date').text().trim();
          const episodeNo = $(el).find('.episode-number, ._episodeNumber, .num, .no, .episode-no').text().trim();
          
          if (title || link) {
            episodes.push({
              title: title || `Episode ${episodeNo || i + 1}`,
              url: link ? (link.startsWith('http') ? link : `https://www.webtoons.com${link}`) : '',
              date: date || 'Unknown',
              episodeNo: episodeNo || String(i + 1)
            });
          }
        });
        
        found = true;
        break;
      }
    }
    
    // Kalo dari selector ga dapet, coba dari script
    if (!found || episodes.length === 0) {
      console.log('🔄 Trying to extract from script tags...');
      
      // Cari di script tags
      const scripts = $('script').filter((i, el) => {
        const text = $(el).html() || '';
        return text.includes('episodeList') || 
               text.includes('episode_list') ||
               text.includes('__NEXT_DATA__');
      });
      
      scripts.each((i, el) => {
        const text = $(el).html() || '';
        try {
          // Coba parse JSON dari script
          const jsonMatch = text.match(/(\{.*\})/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            
            // Cari episodeList di dalam object
            const findEpisodes = (obj: any): any[] => {
              if (!obj) return [];
              if (obj.episodeList) return obj.episodeList;
              if (obj.episode_list) return obj.episode_list;
              if (obj.episodes) return obj.episodes;
              
              for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'object') {
                  const result = findEpisodes(obj[key]);
                  if (result.length > 0) return result;
                }
              }
              return [];
            };
            
            const episodeData = findEpisodes(data);
            if (episodeData.length > 0) {
              episodeData.forEach((ep: any) => {
                episodes.push({
                  title: ep.title || ep.subTitle || ep.episodeTitle || `Episode ${ep.episodeNo}`,
                  url: ep.episodeUrl || ep.url || ep.link || '',
                  date: ep.regDate || ep.date || ep.regdate || 'Unknown',
                  episodeNo: String(ep.episodeNo || ep.no || episodes.length + 1)
                });
              });
            }
          }
        } catch (e) {
          // Skip if parse fails
        }
      });
    }
    
    // Kalo masih kosong, coba dari __NEXT_DATA__
    if (episodes.length === 0) {
      const nextData = $('#__NEXT_DATA__').html();
      if (nextData) {
        try {
          const data = JSON.parse(nextData);
          const props = data.props?.pageProps;
          
          if (props?.episodeList) {
            props.episodeList.forEach((ep: any) => {
              episodes.push({
                title: ep.title || ep.subTitle || `Episode ${ep.episodeNo}`,
                url: ep.episodeUrl || ep.url || '',
                date: ep.regDate || ep.date || 'Unknown',
                episodeNo: String(ep.episodeNo || episodes.length + 1)
              });
            });
          }
        } catch (e) {
          console.log('❌ Failed to parse __NEXT_DATA__');
        }
      }
    }
    
    // Kalo masih kosong, return error
    if (episodes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No episodes found',
        message: 'Could not extract episodes from the page'
      }, { status: 404 });
    }
    
    // Balikin semua episode, urut dari yang terbaru
    return NextResponse.json({
      success: true,
      total: episodes.length,
      source: url,
      episodes: episodes.reverse()
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
