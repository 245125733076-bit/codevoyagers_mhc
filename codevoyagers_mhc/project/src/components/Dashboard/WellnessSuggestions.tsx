import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Lightbulb, Heart } from 'lucide-react';

type Suggestion = {
  title: string;
  description: string;
  icon: string;
};

const suggestions: Record<string, Suggestion[]> = {
  low: [
    {
      title: 'Take a Short Walk',
      description: 'A 10-minute walk can boost your mood and energy levels.',
      icon: '🚶',
    },
    {
      title: 'Practice Deep Breathing',
      description: 'Try 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8.',
      icon: '🧘',
    },
    {
      title: 'Connect with Someone',
      description: 'Reach out to a friend or loved one for a quick chat.',
      icon: '💬',
    },
    {
      title: 'Listen to Uplifting Music',
      description: 'Put on your favorite feel-good playlist.',
      icon: '🎵',
    },
  ],
  medium: [
    {
      title: 'Practice Gratitude',
      description: 'List three things you\'re grateful for today.',
      icon: '🙏',
    },
    {
      title: 'Take a Break',
      description: 'Step away from your tasks for a refreshing 5-minute break.',
      icon: '☕',
    },
    {
      title: 'Stretch Your Body',
      description: 'Do some simple stretches to release tension.',
      icon: '🤸',
    },
    {
      title: 'Drink Water',
      description: 'Stay hydrated - it affects your mood more than you think.',
      icon: '💧',
    },
  ],
  high: [
    {
      title: 'Share Your Joy',
      description: 'Tell someone about what made you happy today.',
      icon: '🌟',
    },
    {
      title: 'Do Something Creative',
      description: 'Channel your positive energy into a creative activity.',
      icon: '🎨',
    },
    {
      title: 'Help Someone',
      description: 'Your good mood can brighten someone else\'s day too.',
      icon: '🤝',
    },
    {
      title: 'Document This Moment',
      description: 'Take a photo or write about what\'s making you feel great.',
      icon: '📸',
    },
  ],
};

export function WellnessSuggestions() {
  const { user } = useAuth();
  const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>([]);
  const [moodLevel, setMoodLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadRecentMood();
  }, [user]);

  const loadRecentMood = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
      const avgMood = data.reduce((sum, m) => sum + m.mood_score, 0) / data.length;

      let level: 'low' | 'medium' | 'high';
      if (avgMood <= 4) level = 'low';
      else if (avgMood <= 7) level = 'medium';
      else level = 'high';

      setMoodLevel(level);
      setCurrentSuggestions(suggestions[level]);
    } else {
      setCurrentSuggestions(suggestions.medium);
    }
  };

  const getMoodColor = () => {
    switch (moodLevel) {
      case 'low':
        return 'from-blue-400 to-cyan-400';
      case 'medium':
        return 'from-green-400 to-teal-400';
      case 'high':
        return 'from-yellow-400 to-orange-400';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`bg-gradient-to-br ${getMoodColor()} p-3 rounded-2xl`}>
          <Heart className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Wellness Tips</h2>
          <p className="text-gray-600 text-sm">Personalized for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSuggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{suggestion.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{suggestion.title}</h3>
                <p className="text-gray-600 text-sm">{suggestion.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-blue-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-gray-700 text-sm">
            <strong>Remember:</strong> Small, consistent actions make a big difference.
            Pick one suggestion and try it today!
          </p>
        </div>
      </div>
    </div>
  );
}
