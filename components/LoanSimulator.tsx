
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, TrendingDown, PiggyBank } from 'lucide-react';
import { SimulationStep } from '../types';

export const LoanSimulator: React.FC = () => {
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [termYears, setTermYears] = useState(20);
  const [overpayment, setOverpayment] = useState(500);

  const data = useMemo(() => {
    const termMonths = termYears * 12;
    const monthlyRate = interestRate / 100 / 12;
    
    // Regular payment calculation
    const standardMonthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    let balanceRegular = principal;
    let balanceOverpay = principal;
    
    const steps: any[] = [];
    let totalInterestRegular = 0;
    let totalInterestOverpay = 0;
    let monthsOverpaySaved = 0;
    let finishedOverpay = false;

    for (let m = 1; m <= termMonths; m++) {
      // Regular Path
      const interestM = balanceRegular * monthlyRate;
      const principalM = standardMonthlyPayment - interestM;
      balanceRegular = Math.max(0, balanceRegular - principalM);
      totalInterestRegular += interestM;

      // Overpayment Path
      if (!finishedOverpay) {
        const interestO = balanceOverpay * monthlyRate;
        const principalO = (standardMonthlyPayment - interestO) + overpayment;
        balanceOverpay = Math.max(0, balanceOverpay - principalO);
        totalInterestOverpay += interestO;
        
        if (balanceOverpay <= 0) {
          finishedOverpay = true;
          monthsOverpaySaved = termMonths - m;
        }
      }

      // Record data points every 6 months for chart performance
      if (m % 12 === 0 || m === 1) {
        steps.push({
          rok: Math.ceil(m / 12),
          "Standardowa spłata": Math.round(balanceRegular),
          "Z nadpłatą": Math.round(balanceOverpay)
        });
      }
    }

    return {
      chartData: steps,
      savings: Math.round(totalInterestRegular - totalInterestOverpay),
      timeSaved: monthsOverpaySaved,
      monthlyPayment: Math.round(standardMonthlyPayment)
    };
  }, [principal, interestRate, termYears, overpayment]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Symulator Oszczędności (Nadpłaty)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Kwota pozostała</label>
            <input 
              type="number" 
              value={principal} 
              onChange={e => setPrincipal(Number(e.target.value))}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Oprocentowanie (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={interestRate} 
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Okres (lata)</label>
            <input 
              type="number" 
              value={termYears} 
              onChange={e => setTermYears(Number(e.target.value))}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase font-bold text-blue-600">Miesięczna Nadpłata (PLN)</label>
            <input 
              type="number" 
              value={overpayment} 
              onChange={e => setOverpayment(Number(e.target.value))}
              className="w-full p-3 border border-blue-200 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-50 rounded-xl p-4 border border-slate-100">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rok" label={{ value: 'Lata', position: 'insideBottomRight', offset: -5 }} />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()} PLN`} />
                <Legend />
                <Line type="monotone" dataKey="Standardowa spłata" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Z nadpłatą" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                <PiggyBank size={20} />
                <span>Łączne oszczędności</span>
              </div>
              <div className="text-2xl font-bold text-emerald-800">
                {data.savings.toLocaleString()} PLN
              </div>
              <p className="text-sm text-emerald-600">tyle oddasz bankowi MNIEJ w formie odsetek.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                <TrendingDown size={20} />
                <span>Krótsza spłata o:</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {Math.floor(data.timeSaved / 12)} lat i {data.timeSaved % 12} mies.
              </div>
              <p className="text-sm text-blue-600">Twoja wolność finansowa przyjdzie szybciej.</p>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-5 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Rata bazowa</div>
              <div className="text-xl font-bold text-slate-800">{data.monthlyPayment.toLocaleString()} PLN</div>
              <p className="text-xs text-slate-500">Bez uwzględnienia Twojej nadpłaty.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
