// Günlük motive edici sözler - API entegrasyonu

export interface Quote {
  text: string;
  author: string;
  category: 'discipline' | 'motivation' | 'success' | 'habit' | 'focus' | 'productivity';
}

// Yedek sözler (API çalışmadığında kullanılır)
export const fallbackQuotes: Quote[] = [
  { text: "Disiplin, yetenekten daha önemlidir.", author: "Tim Notke", category: "discipline" },
  { text: "Motivasyon başlamanı sağlar. Alışkanlık devam etmeni sağlar.", author: "Jim Ryun", category: "discipline" },
  { text: "Bugün yapacağın şey, yarınki seni oluşturur.", author: "Unknown", category: "discipline" },
  { text: "Hayallerin için çalış, yoksa başkasının hayalleri için çalışırsın.", author: "Farrah Gray", category: "motivation" },
  { text: "Başlamak için mükemmel olmak zorunda değilsin.", author: "Zig Ziglar", category: "motivation" },
  { text: "Her uzun yolculuk, tek bir adımla başlar.", author: "Lao Tzu", category: "motivation" },
  { text: "Başarı, hazırlık ve fırsatın buluşmasıdır.", author: "Bobby Unser", category: "success" },
  { text: "Başarı, düşmek değil, düştükten sonra kalkmaktır.", author: "Confucius", category: "success" },
  { text: "Alışkanlıkların kaderindir.", author: "Charles Duhigg", category: "habit" },
  { text: "Her gün 1% daha iyi ol, bir yıl sonra 37 kat daha iyi olursun.", author: "James Clear", category: "habit" },
  { text: "Derin çalışma, derin sonuçlar getirir.", author: "Cal Newport", category: "focus" },
  { text: "Odaklanma bir süper güçtür.", author: "Unknown", category: "focus" },
  { text: "En zor görevi ilk yap, gerisi kolaylaşır.", author: "Brian Tracy", category: "productivity" },
  { text: "Tamamlandı, mükemmelden daha iyidir.", author: "Unknown", category: "productivity" },
];

// API'den söz çek
export async function fetchQuoteFromAPI(): Promise<Quote | null> {
  try {
    // Zen Quotes API - ücretsiz, CORS destekli
    const response = await fetch('https://zenquotes.io/api/random');
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    if (!data || !data[0]) throw new Error('Invalid data');
    
    const quote = data[0];
    
    return {
      text: quote.q,
      author: quote.a || 'Unknown',
      category: 'motivation',
    };
  } catch (error) {
    console.log('API fetch failed, using fallback');
    return null;
  }
}

// API'den günlük söz çek (cache ile)
export async function fetchDailyQuote(): Promise<Quote> {
  const cacheKey = 'focustrack_quote_cache';
  const cacheTimeKey = 'focustrack_quote_cache_time';
  
  // Cache kontrol et
  const cachedTime = localStorage.getItem(cacheTimeKey);
  const today = new Date().toDateString();
  
  if (cachedTime === today) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }
  
  // API'den çek
  const quote = await fetchQuoteFromAPI();
  
  if (quote) {
    // Cache'e kaydet
    localStorage.setItem(cacheKey, JSON.stringify(quote));
    localStorage.setItem(cacheTimeKey, today);
    return quote;
  }
  
  // API başarısız olursa yedekten rastgele seç
  return getRandomFallbackQuote();
}

// Yedekten rastgele söz al
export function getRandomFallbackQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[randomIndex];
}

// Günlük sözü al (tarihe göre deterministik - yedek için)
export function getDailyFallbackQuote(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % fallbackQuotes.length;
  return fallbackQuotes[index];
}

// Rastgele söz al (API veya yedek)
export async function getRandomQuote(): Promise<Quote> {
  const apiQuote = await fetchQuoteFromAPI();
  return apiQuote || getRandomFallbackQuote();
}

// Kategoriye göre söz al (yedekten)
export function getQuoteByCategory(category: Quote['category']): Quote {
  const categoryQuotes = fallbackQuotes.filter(q => q.category === category);
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex] || fallbackQuotes[0];
}

// Eski fonksiyonlar için backward compatibility
export const dailyQuotes = fallbackQuotes;
export function getDailyQuote(): Quote {
  return getDailyFallbackQuote();
}
