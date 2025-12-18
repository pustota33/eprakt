import { supabase } from './supabase';

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds
const CACHE_KEY_PREFIX = "seo_data_";

function getCacheKey(pageType: string, itemId?: string): string {
  return `${CACHE_KEY_PREFIX}${pageType}${itemId ? `_${itemId}` : ""}`;
}

function getFromCache(pageType: string, itemId?: string): SEOData | null {
  try {
    const cacheKey = getCacheKey(pageType, itemId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    // If cache reading fails, just ignore and fetch fresh data
    return null;
  }
}

function setCache(pageType: string, data: SEOData, itemId?: string): void {
  try {
    const cacheKey = getCacheKey(pageType, itemId);
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    // If cache writing fails, just continue without caching
    console.warn("Failed to cache SEO data:", error);
  }
}

export async function loadSEOData(pageType: string, itemId?: string): Promise<SEOData | null> {
  try {
    // Try to get from cache first
    const cachedData = getFromCache(pageType, itemId);
    if (cachedData) {
      return cachedData;
    }

    let query = supabase
      .from('seo_settings')
      .select('meta_title, meta_description, meta_image, og_title, og_description, og_image')
      .eq('page_type', pageType);

    if (itemId) {
      query = query.eq('item_id', itemId);
    } else {
      query = query.is('item_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error loading SEO data:', error);
      return null;
    }

    if (!data) {
      console.log(`No SEO data found for pageType: ${pageType}, itemId: ${itemId}`);
      return null;
    }

    console.log(`SEO data loaded for ${pageType}:`, data);

    const seoData: SEOData = {
      metaTitle: data.meta_title || undefined,
      metaDescription: data.meta_description || undefined,
      metaImage: data.meta_image || undefined,
      ogTitle: data.og_title || undefined,
      ogDescription: data.og_description || undefined,
      ogImage: data.og_image || undefined,
    };

    // Cache the data
    setCache(pageType, seoData, itemId);

    return seoData;
  } catch (error) {
    console.error('Failed to load SEO data:', error);
    return null;
  }
}
