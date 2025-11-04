import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MoodLogger } from './MoodLogger';
import { JournalEntry } from './JournalEntry';
import { MoodAnalytics } from './MoodAnalytics';
import { StreakCounter } from './StreakCounter';
import { MotivationalQuote } from './MotivationalQuote';
import { WellnessSuggestions } from './WellnessSuggestions';
import { AICompanion } from './AICompanion';
import {
  LogOut,
  Home,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

type View = 'home' | 'analytics' | 'chat' | 'journal';

export function Dashboard() {
  const { signOut, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'home' as View, label: 'Home', icon: Home },
    { id: 'analytics' as View, label: 'Analytics', icon: TrendingUp },
    { id: 'journal' as View, label: 'Journal', icon: BookOpen },
    { id: 'chat' as View, label: 'AI Companion', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-pink-400 p-2 rounded-xl">
                <span className="text-2xl">🌸</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Mental Wellness</h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition ml-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MotivationalQuote />
              </div>
              <div className="lg:col-span-1">
                <StreakCounter />
              </div>
            </div>

            <MoodLogger />

            <WellnessSuggestions />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            <MoodAnalytics />
          </div>
        )}

        {currentView === 'journal' && (
          <div className="space-y-6">
            <JournalEntry />
          </div>
        )}

        {currentView === 'chat' && (
          <div className="space-y-6">
            <AICompanion />
          </div>
        )}
      </main>
    </div>
  );
}
