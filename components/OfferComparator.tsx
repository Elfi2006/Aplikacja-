
import React, { useState, useRef } from 'react';
import { compareOffers } from '../services/geminiService';
import { ComparisonResult } from '../types';
import { Columns, Loader2, Trophy, ArrowRight, MinusCircle, PlusCircle, FileText, Upload, X, Info } from 'lucide-react';

interface OfferInput {
  text: string;
  file: { name: string; data: string; mimeType: string } | null;
}

export const OfferComparator: React.FC = () => {
  const [offerInputs, setOfferInputs] = useState<OfferInput[]>([
    { text: '', file: null },
    { text: '', file: null }
  ]);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addOfferField = () => setOfferInputs([...offerInputs, { text: '', file: null }]);
  
  const updateOfferText = (index: number, val: string) => {
    const newInputs = [...offerInputs];
    newInputs[index].text = val;
    setOfferInputs(newInputs);
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      const newInputs = [...offerInputs];
      newInputs[index].file = {
        name: file.name,
        data: base64Data,
        mimeType: file.type
      };
      setOfferInputs(newInputs);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (index: number) => {
    const newInputs = [...offerInputs];
    newInputs[index].file = null;
    setOfferInputs(newInputs);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const removeOffer = (index: number) => {
    if (offerInputs.length <= 2) return;
    setOfferInputs(offerInputs.filter((_, i) => i !== index));
  };

  const handleCompare = async () => {
    const validInputs = offerInputs.filter(o => o.text.trim() || o.file);
    if (validInputs.length < 2) {
      alert("Dodaj przynajmniej dwie oferty (tekst lub plik) do porównania.");
      return;
    }

    setIsComparing(true);
    try {
      const comparisonInputs = validInputs.map(o => ({
        text: o.text,
        file: o.file ? { data: o.file.data, mimeType: o.file.mimeType } : undefined
      }));
      const comparison = await compareOffers(comparisonInputs);
      setResult(comparison);
    } catch (err) {
      alert("Wystąpił błąd podczas porównania ofert.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <Columns className="text-blue-600" />
          Multimodalna Porównywarka Ofert
        </h2>
        <p className="text-slate-500 font-medium mb-8">
          Wklej teksty lub wgraj pliki PDF/Zdjęcia różnych ofert. Nasz ekspert AI przeanalizuje je jednocześnie i wskaże najlepszy wybór.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offerInputs.map((offer, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Oferta #{idx + 1}
                </span>
                {offerInputs.length > 2 && (
                  <button 
                    onClick={() => removeOffer(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <textarea
                  className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 transition-all text-sm leading-relaxed"
                  placeholder="Wklej opis oferty lub kluczowe parametry..."
                  value={offer.text}
                  onChange={(e) => updateOfferText(idx, e.target.value)}
                />

                <div className="relative">
                  {!offer.file ? (
                    <button
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-bold"
                    >
                      <Upload size={18} /> Dodaj plik (PDF/Zdjęcie)
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-600 text-white p-3 rounded-xl shadow-lg animate-in zoom-in-95">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={18} className="shrink-0" />
                        <span className="text-xs font-bold truncate">{offer.file.name}</span>
                      </div>
                      <button onClick={() => clearFile(idx)} className="hover:scale-110 transition-transform">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    ref={el => fileInputRefs.current[idx] = el}
                    onChange={(e) => handleFileChange(idx, e)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={addOfferField}
            disabled={offerInputs.length >= 4}
            className="flex-1 border-2 border-slate-900 py-4 rounded-2xl text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} /> Dodaj kolejny dokument
          </button>
          <button
            onClick={handleCompare}
            disabled={isComparing || offerInputs.filter(o => o.text.trim() || o.file).length < 2}
            className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {isComparing ? <><Loader2 className="animate-spin" /> Ekspert AI porównuje dane...</> : <>Uruchom Porównanie Głębokiej Analizy</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="h-24 w-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                <Trophy size={48} className="text-yellow-400" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2 block">Rekomendacja Matematyczna</span>
                <h3 className="text-4xl font-black tracking-tight mb-2">Zwycięzca: {result.winner}</h3>
                <p className="text-blue-100 font-medium max-w-xl">Na podstawie analizy wszystkich dostarczonych dokumentów, ta oferta generuje najniższe koszty całkowite.</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Columns size={200} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                <h4 className="font-black text-2xl mb-8 flex items-center gap-3">
                  <Info className="text-blue-600" size={28} /> Raport Porównawczy
                </h4>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line font-medium text-lg">
                  {result.mathematicalAnalysis}
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl border-l-8 border-emerald-500">
                <h4 className="font-black text-2xl mb-6 flex items-center gap-3">
                  <ArrowRight className="text-emerald-400" size={28} /> Ostateczny Werdykt
                </h4>
                <p className="text-xl leading-relaxed text-slate-300 font-medium italic">"{result.finalVerdict}"</p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 px-2">Zestawienie Szczegółowe</h4>
              {result.offerSummaries.map((offer, idx) => {
                const isWinner = result.winner.toLowerCase().includes(offer.title.toLowerCase()) || result.winner.includes((idx + 1).toString());
                return (
                  <div key={idx} className={`p-8 rounded-[2rem] border-2 transition-all ${isWinner ? 'bg-blue-50 border-blue-600 shadow-xl shadow-blue-50' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h5 className="font-black text-xl text-slate-900 tracking-tight">{offer.title}</h5>
                      {isWinner && <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">NAJLEPSZA</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/50 p-3 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">RRSO</span>
                        <span className="text-lg font-black text-slate-900">{offer.rrso}</span>
                      </div>
                      <div className="bg-white/50 p-3 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Koszt Całk.</span>
                        <span className="text-lg font-black text-slate-900">{offer.totalCost}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        {offer.pros.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs font-bold text-emerald-600">
                            <PlusCircle size={14} className="shrink-0 mt-0.5" /> <span>{p}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 border-t border-slate-100 pt-4">
                        {offer.cons.map((c, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs font-bold text-red-400">
                            <MinusCircle size={14} className="shrink-0 mt-0.5" /> <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
