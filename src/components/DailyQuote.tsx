import { useState, useEffect } from 'react';
import { Quote, RefreshCw, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchDailyQuote, getRandomQuote, type Quote as QuoteType } from '@/data/quotes';
import { toast } from 'sonner';

export function DailyQuote() {
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // İlk yükleme - API'den çek
  useEffect(() => {
    loadDailyQuote();
  }, []);

  const loadDailyQuote = async () => {
    setIsLoading(true);
    try {
      const dailyQuote = await fetchDailyQuote();
      setQuote(dailyQuote);
    } catch (error) {
      toast.error('Söz yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAnimation = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
      triggerAnimation();
    } catch (error) {
      toast.error('Söz yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!quote) return;
    const textToCopy = `"${quote.text}" - ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success('Söz kopyalandı!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!quote) return;
    const shareData = {
      title: 'Günlük Motivasyon',
      text: `"${quote.text}" - ${quote.author}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Kullanıcı iptal etti
      }
    } else {
      handleCopy();
    }
  };

  const getCategoryLabel = (category?: QuoteType['category']) => {
    if (!category) return 'Motivasyon';
    const labels: Record<string, string> = {
      discipline: 'Disiplin',
      motivation: 'Motivasyon',
      success: 'Başarı',
      habit: 'Alışkanlık',
      focus: 'Odaklanma',
      productivity: 'Üretkenlik',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category?: QuoteType['category']) => {
    const colors: Record<string, string> = {
      discipline: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      motivation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      success: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      habit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      focus: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      productivity: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[category || 'motivation'] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className={`w-full overflow-hidden transition-all duration-500 ${animate ? 'scale-[1.02]' : ''}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Günlük Motivasyon</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(quote?.category)}`}>
            {getCategoryLabel(quote?.category)}
          </span>
        </div>

        {/* Quote */}
        <div className="text-center py-4">
          {isLoading || !quote ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Günlük söz yükleniyor...</p>
            </div>
          ) : (
            <>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground">
                "{quote.text}"
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                — {quote.author}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yeni Söz</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={isLoading || !quote}
            className="gap-1"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline text-green-500">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Kopyala</span>
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isLoading || !quote}
            className="gap-1"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Paylaş</span>
          </Button>
        </div>

        {/* Source indicator */}
        <div className="mt-4 flex justify-center">
          <span className="text-[10px] text-muted-foreground">
            {quote ? 'zenquotes.io' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
