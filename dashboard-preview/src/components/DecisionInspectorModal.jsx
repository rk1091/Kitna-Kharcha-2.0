import React from 'react';
import { X, CheckCircle2, Sparkles, Cpu, Layers, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DecisionInspectorModal({ txn, onClose, onSaveRule, s }) {
  if (!txn) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-[2.5rem] border ${s.card} p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${s.badge}`}>
                {txn.tier}
              </span>
              <span className="text-xs opacity-50 font-mono">ID: {txn.id}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mt-1.5">{txn.name}</h3>
            <p className="text-xs opacity-60 font-sans">{txn.category} • {txn.date || 'Today, 2:15 PM'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount & Classification */}
        <div className="p-4 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs opacity-60 block">Signed Amount</span>
            <div className={`text-2xl font-bold ${s.mono}`}>
              {txn.price}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-60 block">Pipeline Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Sanitized & Encrypted
            </span>
          </div>
        </div>

        {/* Tiered AI Pipeline Inspection Details */}
        <div className="space-y-3 font-sans text-xs">
          <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            Pipeline Decision Log
          </h4>

          <div className="p-4 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 space-y-3">
            <div>
              <span className="text-[11px] opacity-60 block">Raw Bank Statement Entry:</span>
              <code className="block mt-1 font-mono text-[11px] p-2 rounded-xl bg-black/30 border border-white/10 text-theme-primary break-all">
                {txn.rawDescription || `: RAZ*${txn.name.replace(/\s+/g, '')}Bangalore C 00:EMINYKAA`}
              </code>
            </div>

            <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="opacity-50 block">Latency:</span>
                <span className="font-bold font-mono">{txn.tier.includes('Tier 1') ? '0.4 ms' : txn.tier.includes('Tier 2') ? '14 ms' : '260 ms'}</span>
              </div>
              <div>
                <span className="opacity-50 block">Token Cost:</span>
                <span className="font-bold font-mono text-emerald-400">{txn.tier.includes('Tier 3') ? '18 tokens' : '0 tokens'}</span>
              </div>
              <div>
                <span className="opacity-50 block">Confidence:</span>
                <span className="font-bold font-mono text-emerald-400">{txn.confidence || '99.2%'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] opacity-50 block">Engine Logic Reasoning:</span>
              <p className="mt-1 leading-relaxed opacity-80">
                {txn.reasoning || 'Boundary-tolerant substring matching cleanly stripped bank gateway prefixes (RAZ*, WWW DINEOUT) and normalized merchant token to canonical taxonomy.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onSaveRule(txn);
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${s.btn}`}
          >
            <ShieldCheck size={16} />
            <span>Save as User Rule (0 tokens)</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl text-xs font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
