import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/config/api';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { id: string; name: string }[];
}

export type ExportFormat = 'csv' | 'excel' | 'report';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  categories = [],
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [datePreset, setDatePreset] = useState<'all' | '30d' | 'this_month' | 'last_month' | 'custom'>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getDateRange = (): { from?: string; to?: string } => {
    const now = new Date();
    if (datePreset === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return { from: thirtyDaysAgo.toISOString().split('T')[0] };
    }
    if (datePreset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: firstDay.toISOString().split('T')[0] };
    }
    if (datePreset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: firstDay.toISOString().split('T')[0],
        to: lastDay.toISOString().split('T')[0],
      };
    }
    if (datePreset === 'custom') {
      return {
        from: customFrom || undefined,
        to: customTo || undefined,
      };
    }
    return {};
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const range = getDateRange();
    const params: any = {
      ...range,
      categoryId: selectedCategory || undefined,
    };

    try {
      if (format === 'report') {
        const res = await apiClient.get<string>('/export/report', {
          params,
          responseType: 'text',
        });
        // Open report in a new window for immediate viewing and native printing
        const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          // If popup blocked, download as file
          const a = document.createElement('a');
          a.href = url;
          a.download = `kitna-kharcha-executive-report-${new Date().toISOString().split('T')[0]}.html`;
          a.click();
        }
        toast.success('Executive financial report compiled successfully!');
      } else {
        const endpoint = format === 'excel' ? '/export/excel' : '/export/csv';
        const ext = format === 'excel' ? 'xlsx' : 'csv';
        const mimeType =
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv';

        const res = await apiClient.get(endpoint, {
          params,
          responseType: 'blob',
        });

        const blob = new Blob([res.data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kitna-kharcha-transactions-${new Date().toISOString().split('T')[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Exported transactions as .${ext.toUpperCase()} successfully!`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Export Financial Data</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download verified transaction ledgers or generate print-ready executive summaries.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Format Selection Cards */}
          <div className="space-y-2">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <span>Select Export Format</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'csv'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <FileText className="h-5 w-5 mb-2 shrink-0" />
                <div>
                  <p className="font-bold text-foreground text-xs">CSV Table</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Universal plain-text</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'excel'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 mb-2 shrink-0" />
                <div>
                  <p className="font-bold text-foreground text-xs">Excel XLSX</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Native spreadsheet</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('report')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'report'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Printer className="h-5 w-5 mb-2 shrink-0" />
                <div>
                  <p className="font-bold text-foreground text-xs">PDF / Report</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Branded summary</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="space-y-2">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Date Period</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'All Time' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'this_month', label: 'This Month' },
                { key: 'last_month', label: 'Last Month' },
                { key: 'custom', label: 'Custom Range' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setDatePreset(p.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    datePreset === p.key
                      ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                      : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {datePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">From Date</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full h-8 px-2 mt-1 rounded-lg border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">To Date</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full h-8 px-2 mt-1 rounded-lg border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter (Optional) */}
          {format !== 'report' && (
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" />
                <span>Filter by Category (Optional)</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-accent/40 border border-border flex items-start gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              All exports preserve your sanitized records with zero raw PII leakage.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-card/60 flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] font-mono uppercase">
            Format: {format.toUpperCase()}
          </Badge>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isExporting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="h-9 px-5 text-xs font-semibold gap-2 shadow-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Compiling Export...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>{format === 'report' ? 'Generate & View Report' : 'Download File'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
