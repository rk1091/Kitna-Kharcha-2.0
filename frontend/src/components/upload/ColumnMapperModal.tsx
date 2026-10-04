import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UploadCloud,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type ColumnTarget =
  | 'ignore'
  | 'date'
  | 'description'
  | 'debit'
  | 'credit'
  | 'amount'
  | 'balance'
  | 'reference';

export interface ParsedPreview {
  headers: string[];
  rows: string[][];
}

export function parseCSVPreview(rawText: string, maxRows: number = 5): ParsedPreview {
  const firstLine = rawText.split(/\r\n|\n|\r/)[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    const nextChar = rawText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((c) => c !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        if (lines.length > maxRows + 1) break;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((c) => c !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        if (lines.length > maxRows + 1) break;
      } else {
        currentField += char;
      }
    }
  }

  if (currentRow.length > 0 || currentField.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0];
  const rows = lines.slice(1, maxRows + 1);

  return { headers, rows };
}

export function detectColumnTarget(headerName: string): ColumnTarget {
  const norm = headerName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/date|valuedate|txndate|transactiondate|postingdate/i.test(norm)) return 'date';
  if (/narration|description|particulars|details|remarks|transactiondetails/i.test(norm)) return 'description';
  if (/debit|withdrawal|dr|spent|paidout/i.test(norm)) return 'debit';
  if (/credit|deposit|cr|received|paidin/i.test(norm)) return 'credit';
  if (/balance|closingbal|accountbalance/i.test(norm)) return 'balance';
  if (/chq|cheque|ref|utr|referenceno|refno|txnid/i.test(norm)) return 'reference';
  if (/amount|txnamount|totalamount/i.test(norm)) return 'amount';

  return 'ignore';
}

export function validateColumnMapping(mapping: Record<number, ColumnTarget>): {
  isValid: boolean;
  missingFields: string[];
} {
  const targets = Object.values(mapping);
  const hasDate = targets.includes('date');
  const hasAmount =
    targets.includes('amount') || targets.includes('debit') || targets.includes('credit');

  const missing: string[] = [];
  if (!hasDate) missing.push('Date');
  if (!hasAmount) missing.push('Amount (or Debit/Credit)');

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}

interface ColumnMapperModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (mapping: Record<string, number>) => void;
  isUploading?: boolean;
}

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  isOpen,
  file,
  onClose,
  onConfirm,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState<ParsedPreview>({ headers: [], rows: [] });
  const [mapping, setMapping] = useState<Record<number, ColumnTarget>>({});
  const [loading, setLoading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setPreview({ headers: [], rows: [] });
      setMapping({});
      setReadError(null);
      return;
    }

    setLoading(true);
    setReadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setReadError('File appears to be empty or unreadable.');
          setLoading(false);
          return;
        }

        const parsed = parseCSVPreview(text, 5);
        setPreview(parsed);

        // Run smart auto-detection
        const initialMap: Record<number, ColumnTarget> = {};
        parsed.headers.forEach((header, index) => {
          initialMap[index] = detectColumnTarget(header);
        });
        setMapping(initialMap);
      } catch (err: any) {
        setReadError('Could not parse spreadsheet preview: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setReadError('Error reading the selected file.');
      setLoading(false);
    };

    // Read first 32KB of the file
    const slice = file.slice(0, 32768);
    reader.readAsText(slice);
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleSelectChange = (colIndex: number, target: ColumnTarget) => {
    setMapping((prev) => ({
      ...prev,
      [colIndex]: target,
    }));
  };

  const handleResetAutoDetect = () => {
    const initialMap: Record<number, ColumnTarget> = {};
    preview.headers.forEach((header, index) => {
      initialMap[index] = detectColumnTarget(header);
    });
    setMapping(initialMap);
  };

  const { isValid, missingFields } = validateColumnMapping(mapping);

  const handleConfirm = () => {
    if (!isValid) return;

    // Convert columnIndex mapping to target: columnIndex
    const result: Record<string, number> = {};
    Object.entries(mapping).forEach(([colIndex, target]) => {
      if (target !== 'ignore') {
        result[target] = parseInt(colIndex, 10);
      }
    });

    onConfirm(result);
  };

  const targetOptions: { value: ColumnTarget; label: string; color: string }[] = [
    { value: 'ignore', label: '— Ignore Column —', color: 'text-muted-foreground' },
    { value: 'date', label: '📅 Transaction Date', color: 'text-blue-500 font-bold' },
    { value: 'description', label: '📝 Narration / Description', color: 'text-indigo-500 font-bold' },
    { value: 'debit', label: '🔻 Debit / Withdrawal', color: 'text-rose-500 font-bold' },
    { value: 'credit', label: '🟢 Credit / Deposit', color: 'text-emerald-500 font-bold' },
    { value: 'amount', label: '💰 Amount (Single Column)', color: 'text-amber-500 font-bold' },
    { value: 'balance', label: '💳 Balance', color: 'text-cyan-500 font-bold' },
    { value: 'reference', label: '🔖 Reference / Cheque / UTR', color: 'text-violet-500 font-bold' },
  ];

  const getTargetBadgeColor = (target: ColumnTarget) => {
    switch (target) {
      case 'date':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'description':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'debit':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'credit':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'amount':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'balance':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'reference':
        return 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30';
      default:
        return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Interactive Column Mapper</h3>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {file.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review the 5-row preview below and match each column to the required transaction fields.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              Loading spreadsheet preview...
            </div>
          ) : readError ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{readError}</span>
            </div>
          ) : (
            <>
              {/* Guidance Info Banner */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground">
                <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Smart Column Auto-Detection Active</p>
                  <p className="text-muted-foreground text-[11px]">
                    We've pre-selected our best guesses based on your headers. Ensure at least{' '}
                    <strong className="text-foreground">Date</strong> and{' '}
                    <strong className="text-foreground">Amount (or Debit/Credit)</strong> are assigned.
                  </p>
                </div>
              </div>

              {/* 5-Row Preview Table with Interactive Mapping Controls */}
              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border divide-x divide-border">
                        {preview.headers.map((header, idx) => {
                          const currentTarget = mapping[idx] || 'ignore';
                          return (
                            <th key={idx} className="p-3 min-w-[200px] align-top">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                    Col {idx + 1}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${getTargetBadgeColor(
                                      currentTarget
                                    )}`}
                                  >
                                    {currentTarget}
                                  </span>
                                </div>

                                <select
                                  value={currentTarget}
                                  onChange={(e) =>
                                    handleSelectChange(idx, e.target.value as ColumnTarget)
                                  }
                                  disabled={isUploading}
                                  className="w-full h-8 text-xs rounded-lg border border-input bg-background px-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                >
                                  {targetOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                <div className="pt-1">
                                  <p className="text-[10px] text-muted-foreground font-semibold truncate" title={header}>
                                    Header: <span className="text-foreground font-mono">{header || `(Empty)`}</span>
                                  </p>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      {preview.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-accent/30 transition-colors divide-x divide-border"
                        >
                          {preview.headers.map((_, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2.5 max-w-[220px] truncate text-foreground/90 align-top"
                              title={row[cIdx] || ''}
                            >
                              {row[cIdx] !== undefined && row[cIdx] !== '' ? (
                                row[cIdx]
                              ) : (
                                <span className="text-muted-foreground italic">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {isValid ? (
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mapping valid and ready for ingestion.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>Missing required columns: {missingFields.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAutoDetect}
              disabled={isUploading || loading}
              className="h-9 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Guesses</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
              className="h-9 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!isValid || isUploading || loading}
              className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
            >
              {isUploading ? (
                <>
                  <UploadCloud className="h-3.5 w-3.5 animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm Ingestion</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
