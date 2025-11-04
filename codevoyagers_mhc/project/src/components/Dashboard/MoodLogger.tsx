import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Check } from 'lucide-react';

const moodOptions = [
  { score: 1, emoji: '😢', label: 'Terrible' },
  { score: 2, emoji: '😟', label: 'Bad' },
  { score: 3, emoji: '😕', label: 'Not Great' },
  { score: 4, emoji: '😐', label: 'Below Average' },
  { score: 5, emoji: '😶', label: 'Okay' },
  { score: 6, emoji: '🙂', label: 'Fine' },
  { score: 7, emoji: '😊', label: 'Good' },
  { score: 8, emoji: '😄', label: 'Great' },
  { score: 9, emoji: '😁', label: 'Excellent' },
  { score: 10, emoji: '🤩', label: 'Amazing' },
];

export function MoodLogger() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [todayMood, setTodayMood] = useState<{ score: number; emoji: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTodayMood();
  }, [user]);

  const loadTodayMood = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score, emoji')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle();

    if (data) {
      setTodayMood({ score: data.mood_score, emoji: data.emoji });
    }
  };

  const handleMoodSelect = async (score: number, emoji: string) => {
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('mood_entries')
        .upsert(
          {
            user_id: user.id,
            mood_score: score,
            emoji,
            entry_date: today,
          },
          {
            onConflict: 'user_id,entry_date',
          }
        );

      if (error) throw error;

      setTodayMood({ score, emoji });
      setMessage(todayMood ? 'Mood updated!' : 'Mood logged!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to log mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
      <p className="text-gray-600 mb-6">Select your current mood</p>

      {todayMood && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-3xl">{todayMood.emoji}</span>
          <div>
            <p className="text-green-800 font-medium">Today's mood logged</p>
            <p className="text-green-600 text-sm">You can update it anytime</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-3 mb-4">
        {moodOptions.map((mood) => (
          <button
            key={mood.score}
            onClick={() => handleMoodSelect(mood.score, mood.emoji)}
            disabled={loading}
            className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
              todayMood?.score === mood.score
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            title={mood.label}
          >
            <span className="text-3xl block mb-1">{mood.emoji}</span>
            <span className="text-xs text-gray-600 block">{mood.score}</span>
            {todayMood?.score === mood.score && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                <Check size={12} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 text-center">
        <span>Terrible</span>
        <span></span>
        <span>Okay</span>
        <span></span>
        <span>Amazing</span>
      </div>

      {message && (
        <div className={`mt-4 text-center py-2 px-4 rounded-xl ${
          message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
