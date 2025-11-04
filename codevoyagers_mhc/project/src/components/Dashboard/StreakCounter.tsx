import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Flame } from 'lucide-react';

export function StreakCounter() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStreak();
  }, [user]);

  const calculateStreak = async () => {
    if (!user) return;

    try {
      const { data: moods } = await supabase
        .from('mood_entries')
        .select('entry_date')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (!moods || moods.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dates = moods.map(m => new Date(m.entry_date).getTime());
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

      const mostRecentDate = new Date(uniqueDates[0]);
      mostRecentDate.setHours(0, 0, 0, 0);

      if (mostRecentDate.getTime() !== today.getTime() &&
          mostRecentDate.getTime() !== yesterday.getTime()) {
        setStreak(0);
        setLoading(false);
        return;
      }

      let checkDate = new Date(today);
      if (mostRecentDate.getTime() === yesterday.getTime()) {
        checkDate = yesterday;
      }

      for (let i = 0; i < uniqueDates.length; i++) {
        const entryDate = new Date(uniqueDates[i]);
        entryDate.setHours(0, 0, 0, 0);

        if (entryDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/90 font-medium mb-2">Current Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{streak}</span>
            <span className="text-2xl font-medium">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          {streak > 0 && (
            <p className="text-white/80 text-sm mt-2">
              Keep it up! You're doing great 🌟
            </p>
          )}
          {streak === 0 && (
            <p className="text-white/80 text-sm mt-2">
              Log your mood today to start a streak!
            </p>
          )}
        </div>
        <div className="relative">
          <Flame size={64} className={streak > 0 ? 'animate-pulse' : 'opacity-50'} />
          {streak >= 7 && (
            <div className="absolute -top-2 -right-2 bg-yellow-300 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              🔥
            </div>
          )}
        </div>
      </div>

      {streak >= 3 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/90 text-sm">
            {streak >= 30 ? '🏆 Amazing! 30+ days!' :
             streak >= 14 ? '⭐ Two weeks strong!' :
             streak >= 7 ? '🎉 One week milestone!' :
             '💪 Building the habit!'}
          </p>
        </div>
      )}
    </div>
  );
}
