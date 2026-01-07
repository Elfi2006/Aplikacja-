
import React, { useState, useRef } from 'react';
import { analyzeContract } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { ShieldAlert, Info, CheckCircle, AlertTriangle, Loader2, FileSearch, Upload, FileText, X, MessageSquareQuote, Copy } from 'lucide-react';

interface ExtendedResult extends AnalysisResult {
  negotiationScript: string;
}

export const ContractAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      const textReader = new FileReader();
      textReader.onload = (event) => {
        setText(event.target?.result as string);
        setSelectedFile({ name: file.name, type: file.type, data: '' });
      };
      textReader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    try {
      const input: any = {};
      if (text.trim()) input.text = text;
      if (selectedFile?.data) {
        input.file = { data: selectedFile.data, mimeType: selectedFile.type };
      }
      
      const analysis = await analyzeContract(input);
      setResult(analysis as ExtendedResult);
    } catch (err) {
      alert("Wystąpił błąd podczas analizy. Spróbuj ponownie.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    alert("Skopiowano do schowka!");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileSearch className="text-blue-600" />
          Profesjonalny Audyt Oferty
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 italic">Treść dokumentu:</label>
            <textarea
              className="w-full h-44 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed"
              placeholder="Wklej warunki kredytu, fragmenty umowy lub opis oferty..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 italic">Pliki do analizy:</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all gap-2"
            >
              <Upload className="text-slate-400" />
              <span className="text-slate-500 text-sm px-4 text-center font-medium">Przeciągnij lub kliknij, aby dodać PDF / Zdjęcie</span>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".pdf,.csv,.txt,.jpg,.jpeg,.png"
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600" size={18} />
                  <span className="text-sm font-bold text-blue-800 truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <button onClick={clearFile} className="text-blue-400 hover:text-blue-600"><X size={18} /></button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!text.trim() && !selectedFile)}
          className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              Ekspert analizuje dokumenty...
            </>
          ) : (
            <>Uruchom Audyt Finansowy</>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`p-5 border rounded-2xl flex items-center justify-between shadow-sm ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/50 rounded-lg">
                <ShieldAlert size={24} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Ocena Bezpieczeństwa Oferty</span>
                <p className="text-xl font-black">{result.riskLevel === 'LOW' ? 'KORZYSTNA' : result.riskLevel === 'MEDIUM' ? 'WYMAGA POPRAWEK' : 'BARDZO RYZYKOWNA'}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="bg-white/40 px-3 py-1 rounded-full text-xs font-bold">Weryfikacja: Zaawansowany Doradca AI</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
               <Info className="text-blue-600" />
               Podsumowanie Audytu
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium">{result.summary}</p>
          </div>

          {/* Negotiation Script Card */}
          <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <MessageSquareQuote size={60} className="opacity-10" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <MessageSquareQuote className="text-blue-300" />
                  Twój Scenariusz Negocjacyjny
                </h3>
                <button 
                  onClick={() => copyToClipboard(result.negotiationScript)}
                  className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Copy size={14} /> Kopiuj skrypt
                </button>
              </div>
              <div className="bg-blue-800/50 p-5 rounded-xl border border-blue-700 text-blue-50 leading-relaxed italic">
                {result.negotiationScript.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>)}
              </div>
              <p className="mt-4 text-xs text-blue-300 font-medium tracking-tight uppercase">
                Użyj tych argumentów podczas rozmowy z doradcą w banku, aby uzyskać lepsze warunki.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                Pułapki i Koszty
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Wykryte Nieścisłości</h4>
                  <ul className="list-disc ml-5 space-y-2 text-slate-700 mt-2 text-sm">
                    {result.hiddenFees.map((fee, i) => <li key={i} className="font-medium">{fee}</li>)}
                    {result.hiddenFees.length === 0 && <li className="text-slate-400 italic">Brak widocznych ukrytych kosztów.</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Czerwone Flagi (Ryzyka)</h4>
                  <ul className="list-disc ml-5 space-y-2 text-slate-700 mt-2 text-sm">
                    {result.risks.map((risk, i) => <li key={i} className="font-medium">{risk}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info className="text-blue-500" />
                Słownik Ekspercki
              </h3>
              <div className="space-y-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {result.jargonExplained.map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <span className="font-black text-blue-900 block text-sm uppercase tracking-tight mb-1">{item.term}</span>
                    <span className="text-xs text-slate-600 font-medium">{item.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="font-black text-2xl mb-4 flex items-center gap-3">
              <CheckCircle size={32} />
              Strategia Aktywnego Oddłużania
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {result.savingsTips.map((tip, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  <p className="text-sm font-bold leading-tight">{tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Doradca AI jest do Twojej dyspozycji 24/7</p>
               <button className="bg-white text-emerald-700 px-6 py-2 rounded-full font-black text-sm uppercase tracking-tighter hover:scale-105 transition-transform">
                  Drukuj Raport Audytu
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
