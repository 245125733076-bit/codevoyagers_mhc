import { useEffect, useState } from 'react';
import { supabase, MotivationalQuote as Quote } from '../../lib/supabase';
import { RefreshCw, Sparkles } from 'lucide-react';

export function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyQuote();
  }, []);

  const loadDailyQuote = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('motivational_quotes')
        .select('*');

      if (data && data.length > 0) {
        const today = new Date().getDate();
        const quoteIndex = today % data.length;
        setQuote(data[quoteIndex]);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRandomQuote = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('motivational_quotes')
        .select('*');

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setQuote(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-lg p-6 animate-pulse">
        <div className="h-24 bg-white/20 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h3 className="font-semibold">Daily Affirmation</h3>
          </div>
          <button
            onClick={loadRandomQuote}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition"
            title="Get another quote"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {quote && (
          <>
            <p className="text-lg font-medium mb-3 leading-relaxed">
              "{quote.quote}"
            </p>
            {quote.author && (
              <p className="text-white/80 text-sm">
                — {quote.author}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
