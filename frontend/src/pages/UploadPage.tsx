import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  ArrowRight,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { FileDropZone } from '@/components/upload/FileDropZone';
import { RawTextPaste } from '@/components/upload/RawTextPaste';

interface StatementStatusResponse {
  id: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  healthScore?: number | null;
  bankName?: string | null;
  errorMessage?: string | null;
  _count?: {
    transactions: number;
  };
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);
  const [statementResult, setStatementResult] = useState<StatementStatusResponse | null>(null);

  const pollingTimerRef = useRef<any>(null);

  // Interval polling hook checking GET /statements/:id every 2.5s while PENDING or PROCESSING (Task A11)
  useEffect(() => {
    if (!activeStatementId) return;

    const pollStatus = async () => {
      try {
        const res = await apiClient.get<StatementStatusResponse>(`/statements/${activeStatementId}`);
        const data = res.data;
        setStatementResult(data);

        if (data.parseStatus === 'COMPLETED') {
          clearInterval(pollingTimerRef.current);
          setIsProcessing(false);
          const count = data._count?.transactions ?? 0;
          toast.success(`Statement parsed successfully! ${count} transactions imported.`);
        } else if (data.parseStatus === 'FAILED') {
          clearInterval(pollingTimerRef.current);
          setIsProcessing(false);
          toast.error(data.errorMessage || 'Statement parsing failed.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Poll immediately, then every 2500ms
    pollStatus();
    pollingTimerRef.current = setInterval(pollStatus, 2500);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [activeStatementId]);

  // Handle File Upload
  const handleFileUpload = async (file: File, password?: string) => {
    setIsProcessing(true);
    setStatementResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    try {
      const res = await apiClient.post<StatementStatusResponse>('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.info(`Uploaded "${file.name}". Starting privacy masking & classification...`);
      setActiveStatementId(res.data.id);
      setStatementResult(res.data);
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err?.response?.data?.message || 'Failed to upload statement';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  // Handle Text Import
  const handleTextImport = async (text: string) => {
    setIsProcessing(true);
    setStatementResult(null);

    try {
      const res = await apiClient.post<StatementStatusResponse>('/statements/import-text', {
        text,
      });

      toast.info('Statement text ingested. Sanitizing PII and parsing...');
      setActiveStatementId(res.data.id);
      setStatementResult(res.data);
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err?.response?.data?.message || 'Failed to import statement text';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const resetUpload = () => {
    setActiveStatementId(null);
    setStatementResult(null);
    setIsProcessing(false);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <p className="font-bold text-foreground">Zero Raw PII Leaves Your Device</p>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Active Sanitizer
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 leading-relaxed">
            All bank statements, account numbers, names, PAN, Aadhaar, HSN, and UPI identifiers are scrubbed in-memory via deterministic regular expression sanitization before processing.
          </p>
        </div>
      </div>

      {/* Upload Processing / Completion Status Card */}
      {statementResult && (
        <Card className="shadow-md border-border bg-card animate-in fade-in duration-300">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {statementResult.parseStatus === 'COMPLETED' ? (
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : statementResult.parseStatus === 'FAILED' ? (
                  <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-primary/15 text-primary animate-spin">
                    <RotateCw className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {statementResult.parseStatus === 'COMPLETED'
                      ? 'Statement Parsing & Classification Complete!'
                      : statementResult.parseStatus === 'FAILED'
                        ? 'Statement Processing Failed'
                        : 'Processing Statement...'}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {statementResult.fileName.replace(/^.*[\\/]/, '')}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {statementResult.parseStatus === 'COMPLETED' && statementResult.healthScore !== null && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {statementResult.healthScore?.toFixed(0)}% Parser Health
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {/* Live Pipeline Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-accent/40 border border-border flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">1. Client Sanitization</p>
                  <p className="text-[10px] text-muted-foreground">PII Scrubbed & Masked</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/40 border border-border flex items-center gap-3">
                {statementResult.parseStatus === 'COMPLETED' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : statementResult.parseStatus === 'FAILED' ? (
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-foreground">2. Table Extraction</p>
                  <p className="text-[10px] text-muted-foreground">
                    {statementResult.parseStatus === 'COMPLETED'
                      ? '100% Extracted'
                      : statementResult.parseStatus === 'FAILED'
                        ? 'Failed to Parse'
                        : 'Normalizing Fields'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/40 border border-border flex items-center gap-3">
                {statementResult.parseStatus === 'COMPLETED' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-foreground">3. Tiered AI Classification</p>
                  <p className="text-[10px] text-muted-foreground">
                    {statementResult.parseStatus === 'COMPLETED'
                      ? `${statementResult._count?.transactions ?? 0} Classified`
                      : 'Compound Rules'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message if Failed */}
            {statementResult.parseStatus === 'FAILED' && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                <p className="font-bold">Error Details:</p>
                <p>{statementResult.errorMessage || 'Parser could not extract valid transactions from this file.'}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tip: If your statement is an encrypted PDF, make sure to enter the statement password before uploading.
                </p>
              </div>
            )}

            {/* Completion CTA */}
            {statementResult.parseStatus === 'COMPLETED' && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  <strong className="text-foreground font-semibold">
                    {statementResult._count?.transactions ?? 0} transactions
                  </strong>{' '}
                  ready for exploration.
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUpload}
                    className="h-8 text-xs font-medium"
                  >
                    Upload Another
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/transactions?statementId=${statementResult.id}`)}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>View Transactions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Upload Selector & Container */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                Upload Statements Hub
              </CardTitle>
              <CardDescription className="text-xs">
                Ingest bank statements across formats with local PII protection
              </CardDescription>
            </div>

            {/* Format Tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                disabled={isProcessing}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'file'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Statement File (PDF / CSV / Excel)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                disabled={isProcessing}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'text'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Raw Text Paste
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {activeTab === 'file' ? (
            <FileDropZone onUpload={handleFileUpload} isUploading={isProcessing} />
          ) : (
            <RawTextPaste onImport={handleTextImport} isImporting={isProcessing} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
