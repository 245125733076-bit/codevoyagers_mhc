import { useState, useEffect, useRef } from 'react';
import { supabase, ChatMessage as Message } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Bot, User } from 'lucide-react';

const responses: Record<string, string[]> = {
  greeting: [
    "Hello! I'm here to support you. How are you feeling today?",
    "Hi there! It's great to see you. What's on your mind?",
    "Welcome! I'm here to listen. How can I help you today?",
  ],
  sad: [
    "I'm sorry you're feeling down. Remember, it's okay to have difficult days. Would you like to talk about what's bothering you?",
    "Your feelings are valid. Sometimes just acknowledging how we feel can be helpful. I'm here to listen.",
    "I hear you. Tough moments are part of life, but they don't define you. You're stronger than you know.",
  ],
  anxious: [
    "Anxiety can be overwhelming. Try taking a few deep breaths with me. Inhale for 4... hold for 4... exhale for 4.",
    "It's normal to feel anxious sometimes. Remember, you've gotten through difficult times before, and you can do it again.",
    "Let's ground ourselves. Can you name 5 things you can see right now? This can help bring you back to the present.",
  ],
  happy: [
    "That's wonderful! I'm so glad you're feeling good. What's bringing you joy today?",
    "It's great to hear you're doing well! Savoring positive moments is so important.",
    "Your happiness is contagious! Thank you for sharing this positive energy with me.",
  ],
  stressed: [
    "Stress can be tough to handle. Remember to take things one step at a time. What's one small thing you could do right now to help yourself?",
    "It sounds like you have a lot on your plate. Have you considered breaking down your tasks into smaller, manageable pieces?",
    "Taking care of yourself during stressful times is crucial. Have you had a chance to rest today?",
  ],
  grateful: [
    "Gratitude is such a powerful practice. It's wonderful that you're taking time to appreciate the good things.",
    "That's beautiful. Focusing on what we're grateful for can really shift our perspective.",
    "Thank you for sharing that. Practicing gratitude is one of the best things we can do for our mental health.",
  ],
  default: [
    "I understand. Tell me more about how you're feeling.",
    "Thank you for sharing that with me. Your feelings matter.",
    "I'm here to listen and support you. What else would you like to talk about?",
    "That makes sense. How are you coping with everything?",
    "I appreciate you opening up. Remember, it's okay to feel whatever you're feeling.",
  ],
};

function getResponseCategory(message: string): keyof typeof responses {
  const lower = message.toLowerCase();

  if (lower.match(/\b(hi|hello|hey|good morning|good afternoon)\b/)) {
    return 'greeting';
  }
  if (lower.match(/\b(sad|depressed|down|unhappy|miserable|awful)\b/)) {
    return 'sad';
  }
  if (lower.match(/\b(anxious|anxiety|worried|nervous|scared|fear)\b/)) {
    return 'anxious';
  }
  if (lower.match(/\b(happy|great|wonderful|amazing|excited|good|better)\b/)) {
    return 'happy';
  }
  if (lower.match(/\b(stressed|stress|overwhelmed|busy|pressure)\b/)) {
    return 'stressed';
  }
  if (lower.match(/\b(grateful|thankful|appreciate|blessed|fortunate)\b/)) {
    return 'grateful';
  }

  return 'default';
}

export function AICompanion() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data);
    }

    if (!data || data.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        user_id: user.id,
        message: "Hello! I'm your Mental Wellness Companion. I'm here to listen and support you on your journey. How are you feeling today?",
        is_user: false,
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async () => {
    if (!user || !input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const { data: savedUserMsg } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: userMessage,
          is_user: true,
        })
        .select()
        .single();

      if (savedUserMsg) {
        setMessages((prev) => [...prev, savedUserMsg]);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const category = getResponseCategory(userMessage);
      const categoryResponses = responses[category];
      const botResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

      const { data: savedBotMsg } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: botResponse,
          is_user: false,
        })
        .select()
        .single();

      if (savedBotMsg) {
        setMessages((prev) => [...prev, savedBotMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col h-[600px]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-2xl">
          <Bot className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Companion</h2>
          <p className="text-gray-600 text-sm">Here to listen and support you</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.is_user ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.is_user
                  ? 'bg-gradient-to-br from-blue-400 to-pink-400'
                  : 'bg-gradient-to-br from-teal-400 to-blue-500'
              }`}
            >
              {msg.is_user ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.is_user
                  ? 'bg-gradient-to-br from-blue-400 to-pink-400 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.message}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.is_user ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-teal-400 to-blue-500 text-white p-3 rounded-xl hover:from-teal-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
