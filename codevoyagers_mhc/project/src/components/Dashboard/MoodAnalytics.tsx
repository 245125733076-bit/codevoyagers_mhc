import { useEffect, useState } from 'react';
import { supabase, MoodEntry } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Calendar } from 'lucide-react';

type MoodStats = {
  average: number;
  trend: 'up' | 'down' | 'stable';
  totalEntries: number;
};

export function MoodAnalytics() {
  const { user } = useAuth();
  const [weeklyMoods, setWeeklyMoods] = useState<MoodEntry[]>([]);
  const [monthlyMoods, setMonthlyMoods] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats>({ average: 0, trend: 'stable', totalEntries: 0 });
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadMoodData();
  }, [user, timeRange]);

  const loadMoodData = async () => {
    if (!user) return;

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const targetDate = timeRange === 'week' ? weekAgo : monthAgo;

    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', targetDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    if (data) {
      if (timeRange === 'week') {
        setWeeklyMoods(data);
      } else {
        setMonthlyMoods(data);
      }
      calculateStats(data);
    }
  };

  const calculateStats = (moods: MoodEntry[]) => {
    if (moods.length === 0) {
      setStats({ average: 0, trend: 'stable', totalEntries: 0 });
      return;
    }

    const average = moods.reduce((sum, m) => sum + m.mood_score, 0) / moods.length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (moods.length >= 2) {
      const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
      const secondHalf = moods.slice(Math.floor(moods.length / 2));

      const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood_score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood_score, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) trend = 'up';
      else if (secondAvg < firstAvg - 0.5) trend = 'down';
    }

    setStats({ average, trend, totalEntries: moods.length });
  };

  const currentMoods = timeRange === 'week' ? weeklyMoods : monthlyMoods;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-400 to-teal-400 p-3 rounded-2xl">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mood Analytics</h2>
            <p className="text-gray-600 text-sm">Track your emotional journey</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {currentMoods.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No mood entries yet for this period</p>
          <p className="text-gray-400 text-sm mt-2">Start logging your daily mood to see analytics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <p className="text-blue-600 text-sm font-medium mb-1">Average Mood</p>
              <p className="text-3xl font-bold text-blue-700">{stats.average.toFixed(1)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <p className="text-green-600 text-sm font-medium mb-1">Trend</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4">
              <p className="text-pink-600 text-sm font-medium mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-pink-700">{stats.totalEntries}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Mood History</h3>
            {currentMoods.slice(-10).reverse().map((mood) => (
              <div
                key={mood.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mood.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(mood.entry_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Score: {mood.mood_score}/10</p>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-teal-400 h-2 rounded-full"
                    style={{ width: `${(mood.mood_score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
