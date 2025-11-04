import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, BookOpen } from 'lucide-react';

export function JournalEntry() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasEntry, setHasEntry] = useState(false);

  useEffect(() => {
    loadTodayJournal();
  }, [user]);

  const loadTodayJournal = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('journal_entries')
      .select('content')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle();

    if (data) {
      setContent(data.content);
      setHasEntry(true);
    }
  };

  const handleSave = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('journal_entries')
        .upsert(
          {
            user_id: user.id,
            content: content.trim(),
            entry_date: today,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,entry_date',
          }
        );

      if (error) throw error;

      setHasEntry(true);
      setMessage('Journal entry saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-pink-400 to-orange-400 p-3 rounded-2xl">
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Journal</h2>
          <p className="text-gray-600 text-sm">Write your thoughts and reflections</p>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="How was your day? What are you grateful for? What's on your mind?..."
        className="w-full h-48 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition resize-none"
      />

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          {content.length} characters
        </p>
        <button
          onClick={handleSave}
          disabled={loading || !content.trim()}
          className="bg-gradient-to-r from-pink-400 to-orange-400 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-500 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save size={18} />
          {hasEntry ? 'Update Entry' : 'Save Entry'}
        </button>
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
