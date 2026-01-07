
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAdvisor } from '../services/geminiService';
import { Send, User, Bot, Loader2, MessageSquareQuote } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Witaj! Jestem Twoim Zaawansowanym Doradcą Finansowym. W czym mogę Ci dzisiaj pomóc? Mogę przeanalizować Twoją ofertę, przygotować strategię negocjacyjną lub wyjaśnić zawiłości kredytowe.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithAdvisor(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Przepraszam, wystąpił problem z odpowiedzią.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Błąd połączenia. Spróbuj ponownie później.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <MessageSquareQuote size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Czat z Doradcą AI</h3>
          <p className="text-xs text-emerald-600 font-medium">Aktywna ochrona klienta</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                {m.role === 'user' ? <User size={16} className="text-blue-600" /> : <Bot size={16} className="text-slate-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {m.text.split('\n').map((line, idx) => <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-xs font-medium text-slate-500 italic">Doradca analizuje Twoje zapytanie...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-slate-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Zapytaj o warunki, negocjacje lub wyjaśnij termin..."
            className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
