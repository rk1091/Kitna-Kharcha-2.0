import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function StatementUploadCard({ s, onTransactionsAdded }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lastUploadedBank, setLastUploadedBank] = useState('HDFC Bank');

  const handleSimulateUpload = (bankName = 'HDFC Bank') => {
    if (isScanning) return;
    setIsScanning(true);
    setUploadSuccess(false);
    setLastUploadedBank(bankName);

    setTimeout(() => {
      setIsScanning(false);
      setUploadSuccess(true);
      if (onTransactionsAdded) {
        onTransactionsAdded(bankName);
      }
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
    }, 2200);
  };

  return (
    <div className={`col-span-12 lg:col-span-5 rounded-[3rem] border ${s.card} p-7 sm:p-9 flex flex-col justify-between shadow-sm transition-all duration-300 relative overflow-hidden group`}>
      
      {/* Laser Scanning Beam Animation */}
      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan z-30 shadow-[0_0_15px_#22d3ee]" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <UploadCloud size={20} className={s.accent} />
          </div>
          <div>
            <h4 className="font-bold text-base">Statement Ingestion</h4>
            <p className="text-[11px] opacity-60 font-sans">Local PDF/CSV parser • Zero Cloud Leak</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          On-Device OCR
        </span>
      </div>

      {/* Drop Area */}
      <div
        onClick={() => handleSimulateUpload('HDFC Bank')}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => { e.preventDefault(); setIsHovering(false); handleSimulateUpload('ICICI Bank'); }}
        className={`my-3 p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden flex flex-col items-center justify-center ${
          isHovering
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-white/15 bg-black/5 dark:bg-white/[0.02] hover:border-white/30 hover:bg-black/10'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
          {isScanning ? (
            <RefreshCw size={26} className="animate-spin text-cyan-400" />
          ) : uploadSuccess ? (
            <CheckCircle2 size={26} className="text-emerald-400" />
          ) : (
            <FileText size={26} className={s.accent} />
          )}
        </div>

        {isScanning ? (
          <div className="space-y-1">
            <div className="text-sm font-bold text-cyan-300">
              Tokenizing Statement Tables...
            </div>
            <p className="text-[11px] opacity-60 font-mono">
              Stripping PII & running boundary substring normalizer
            </p>
          </div>
        ) : uploadSuccess ? (
          <div className="space-y-1">
            <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>Parsed 42 Transactions!</span>
            </div>
            <p className="text-[11px] opacity-70 font-sans">
              28 Tier 1 Regex • 10 Tier 2 Pattern • 4 Tier 3 LLM
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm font-bold">
              Drop Bank Statement PDF / CSV
            </div>
            <p className="text-[11px] opacity-50 font-sans">
              Click to simulate ingest from HDFC, SBI, ICICI, Axis
            </p>
          </div>
        )}
      </div>

      {/* Quick Bank Selector Pills */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] opacity-50 font-sans">Quick Demo Ingest:</span>
        <div className="flex items-center gap-1.5">
          {['HDFC', 'SBI', 'ICICI', 'Axis'].map((bank) => (
            <button
              key={bank}
              onClick={(e) => {
                e.stopPropagation();
                handleSimulateUpload(`${bank} Bank`);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold transition-colors"
            >
              +{bank}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
