
export interface AnalysisResult {
  summary: string;
  hiddenFees: string[];
  risks: string[];
  jargonExplained: Array<{ term: string; explanation: string }>;
  savingsTips: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ComparisonResult {
  winner: string; // Title or ID of the best offer
  mathematicalAnalysis: string;
  offerSummaries: Array<{
    title: string;
    totalCost: string;
    rrso: string;
    pros: string[];
    cons: string[];
  }>;
  finalVerdict: string;
}

export interface LoanDetails {
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  overpayment: number;
}

export interface SimulationStep {
  month: number;
  remainingBalance: number;
  interestPaid: number;
  principalPaid: number;
}
