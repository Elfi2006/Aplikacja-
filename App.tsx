
import React, { useState } from 'react';
import { ShieldCheck, LayoutDashboard, FileText, Calculator, HelpCircle, MessageCircle, Menu, X, Star, Columns } from 'lucide-react';
import { ContractAnalyzer } from './components/ContractAnalyzer';
import { LoanSimulator } from './components/LoanSimulator';
import { ChatAdvisor } from './components/ChatAdvisor';
import { OfferComparator } from './components/OfferComparator';

type Tab = 'dashboard' | 'analyzer' | 'comparator' | 'simulator' | 'chat' | 'jargon';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Audyt Umowy', icon: FileText },
    { id: 'comparator', label: 'Porównaj Oferty', icon: Columns },
    { id: 'simulator', label: 'Plan Nadpłat', icon: Calculator },
    { id: 'chat', label: 'Czat z Doradcą', icon: MessageCircle },
    { id: 'jargon', label: 'Centrum Wiedzy', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl border border-white/20"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-slate-900 p-2.5 rounded-xl rotate-3 shadow-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900">
                STRAŻNIK <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advanced Fin-Advocacy</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group
                    ${activeTab === item.id 
                      ? 'bg-slate-900 text-white font-bold shadow-xl shadow-slate-200' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                  `}
                >
                  <Icon size={20} className={activeTab === item.id ? 'text-blue-400' : 'group-hover:text-blue-600'} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={10} className="fill-blue-300 text-blue-300" />)}
              </div>
              <p className="text-sm font-black leading-tight mb-2">TRYB EKSPERCKI AKTYWNY</p>
              <p className="text-[11px] font-medium opacity-80 mb-4">Twój asystent analizuje rynek w czasie rzeczywistym.</p>
              <button 
                onClick={() => setActiveTab('chat')}
                className="w-full bg-white text-blue-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
              >
                Uruchom Doradcę
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-slate-50/50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-6 px-10 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {navigation.find(n => n.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ochrona klienta aktywna: 24/7 Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-black text-slate-800">Użytkownik Premium</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">V.I.P. Advocacy</span>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center font-black text-white text-lg">
                JA
             </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-200 transition-all">
                   <div>
                      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Przeanalizowane Oferty</h3>
                      <p className="text-5xl font-black text-slate-900">08</p>
                   </div>
                   <p className="text-xs font-bold text-slate-400 mt-6 flex items-center gap-2">
                     <Star size={12} className="text-blue-500" />
                     Skuteczność negocjacji: +12.4%
                   </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                   <div>
                      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Zaoszczędzone Odsetki</h3>
                      <p className="text-5xl font-black text-emerald-600 tracking-tighter">18 200 <span className="text-2xl">PLN</span></p>
                   </div>
                   <p className="text-xs font-bold text-emerald-600 mt-6 bg-emerald-50 px-3 py-1.5 rounded-full self-start">
                     ▲ Realna wartość oszczędności
                   </p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white md:col-span-2 lg:col-span-1 relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Alert Ekspercki</h3>
                      <p className="text-xl font-bold leading-tight mb-8">Twoja marża kredytowa jest powyżej średniej rynkowej o 0.8 pkt proc.</p>
                      <button 
                        onClick={() => setActiveTab('comparator')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Porównaj rynkowo
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 p-4">
                     <ShieldCheck size={80} className="text-white opacity-5" />
                   </div>
                </div>

                <div className="lg:col-span-3">
                   <div className="bg-white border border-slate-200 rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="font-black text-xl tracking-tight">Najnowsze Porady Negocjacyjne</h3>
                         <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Zobacz wszystkie</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           "Jak zbić marżę, gdy posiadasz ubezpieczenie zewnętrzne?",
                           "Prowizja 0% - czy to zawsze się opłaca?",
                           "WIBOR vs WIRON - co musisz wiedzieć w 2024?",
                           "Kiedy bank musi obniżyć koszt Twojego kredytu?"
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                             <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Star size={18} />
                             </div>
                             <span className="text-sm font-bold text-slate-700">{item}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'analyzer' && <ContractAnalyzer />}
          
          {activeTab === 'comparator' && <OfferComparator />}

          {activeTab === 'simulator' && <LoanSimulator />}

          {activeTab === 'chat' && <ChatAdvisor />}

          {activeTab === 'jargon' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
               <div className="mb-10">
                  <h2 className="text-3xl font-black tracking-tight mb-2">Baza Wiedzy Eksperckiej</h2>
                  <p className="text-slate-500 font-medium">Zrozum język bankierów, aby móc skutecznie negocjować.</p>
               </div>
               <div className="grid grid-cols-1 gap-8">
                 {[
                   { q: "Czym jest 'Cross-selling' w banku?", a: "To sprzedaż produktów dodatkowych (np. karta kredytowa, ubezpieczenie) w zamian za obniżenie marży kredytu. Zawsze przelicz, czy koszt tych produktów nie przewyższa oszczędności na marży!" },
                   { q: "Klauzule Abuzywne - co to?", a: "To zapisy w umowach, które naruszają dobre obyczaje i interesy konsumenta. Prawo uznaje je za niewiążące. Nasz Strażnik AI aktywnie ich szuka w Twoich dokumentach." },
                   { q: "Nadpłata a Skrócenie Okresu Kredytowania", a: "Nadpłacając kredyt, możesz albo zmniejszyć miesięczną ratę, albo skrócić czas spłaty. To drugie rozwiązanie zazwyczaj generuje znacznie większe oszczędności na odsetkach." }
                 ].map((item, i) => (
                   <div key={i} className="group border-l-4 border-slate-100 pl-8 py-2 hover:border-blue-600 transition-all">
                      <h3 className="font-black text-xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{item.q}</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{item.a}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <footer className="mt-auto py-12 px-10 bg-slate-900 text-slate-500 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6 opacity-30">
              <ShieldCheck size={20} />
              <span className="font-black tracking-[0.3em] uppercase text-xs">Strażnik AI - Financial Advocacy System</span>
            </div>
            <p className="text-xs font-bold leading-loose max-w-2xl mx-auto">
              Aplikacja wykorzystuje model Gemini 3 Flash do zaawansowanej analizy dokumentów finansowych. 
              Przedstawione dane i scenariusze negocjacyjne mają charakter doradczy. Zawsze skonsultuj ostateczną decyzję z prawnikiem lub niezależnym doradcą finansowym.
            </p>
            <p className="mt-8 text-[10px] opacity-40">&copy; 2024 V.I.P. Advocacy Solutions. Wszelkie prawa zastrzeżone.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
