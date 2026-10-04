import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  FileText,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Receipt,
  RotateCw,
  Search,
  Building2,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';

interface StatementUpload {
  id: string;
  fileName: string;
  filePath: string;
  inputType: 'PDF' | 'TEXT' | 'CSV' | 'EXCEL';
  uploadedAt: string;
  parseStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankName?: string | null;
  statementPeriodStart?: string | null;
  statementPeriodEnd?: string | null;
  healthScore?: number | null;
  errorMessage?: string | null;
  contentFingerprint?: string | null;
  _count?: {
    transactions: number;
  };
}

export const StatementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statements, setStatements] = useState<StatementUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statementToDelete, setStatementToDelete] = useState<StatementUpload | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const fetchStatements = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await apiClient.get<StatementUpload[]>('/statements');
      setStatements(res.data || []);
    } catch (err) {
      console.error('Failed to fetch statements:', err);
      if (!isSilent) toast.error('Failed to load statements list');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  // Auto-poll every 3s if any statement is PENDING or PROCESSING
  useEffect(() => {
    const hasActiveProcessing = statements.some(
      (s) => s.parseStatus === 'PENDING' || s.parseStatus === 'PROCESSING',
    );

    if (!hasActiveProcessing) return;

    const interval = setInterval(() => {
      fetchStatements(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [statements, fetchStatements]);

  const handleDeleteStatement = async () => {
    if (!statementToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.delete(`/statements/${statementToDelete.id}`);
      toast.success(`Deleted statement "${statementToDelete.fileName}" and associated transactions`);
      setStatements((prev) => prev.filter((s) => s.id !== statementToDelete.id));
      setStatementToDelete(null);
    } catch (err) {
      console.error('Failed to delete statement:', err);
      toast.error('Failed to delete statement. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReclassify = async (statementId: string, fileName: string) => {
    setReprocessingId(statementId);
    try {
      await apiClient.post(`/statements/${statementId}/reclassify`);
      toast.info(`Queued "${fileName}" for re-classification`);
      // Update status locally to PROCESSING
      setStatements((prev) =>
        prev.map((s) =>
          s.id === statementId ? { ...s, parseStatus: 'PROCESSING' } : s,
        ),
      );
    } catch (err) {
      console.error('Failed to reclassify statement:', err);
      toast.error('Failed to queue re-classification');
    } finally {
      setReprocessingId(null);
    }
  };

  const filteredStatements = statements.filter((s) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (s.fileName || '').toLowerCase().includes(query);
    const bankMatch = (s.bankName || '').toLowerCase().includes(query);
    const typeMatch = (s.inputType || '').toLowerCase().includes(query);
    return nameMatch || bankMatch || typeMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold"
          >
            <CheckCircle2 className="h-3 w-3" />
            Parsed
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 animate-pulse font-semibold"
          >
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground font-semibold">
            <Clock className="h-3 w-3" />
            Queued
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px] font-semibold">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return '—';
    const s = start
      ? new Date(start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '?';
    const e = end
      ? new Date(end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '?';
    return `${s} → ${e}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Statements Management
            <Building2 className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit bank statement ingestion, review parser health scores, and trigger reclassification.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStatements(false)}
            className="h-8 gap-2 text-xs font-medium"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/upload')}
            className="h-8 gap-2 text-xs font-medium"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload Statement
          </Button>
        </div>
      </div>

      {/* Main Card with Search and Table */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Uploaded Statement Records
              </CardTitle>
              <CardDescription className="text-xs">
                {statements.length} total statements ingested with local privacy masking
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search statements or banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[11px] font-semibold">Bank / Source</TableHead>
                <TableHead className="text-[11px] font-semibold">File & Format</TableHead>
                <TableHead className="text-[11px] font-semibold">Period Covered</TableHead>
                <TableHead className="text-[11px] font-semibold">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-center">Txns</TableHead>
                <TableHead className="text-[11px] font-semibold">Health</TableHead>
                <TableHead className="text-[11px] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-xs text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                    Loading statement records...
                  </TableCell>
                </TableRow>
              ) : filteredStatements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-xs text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium text-foreground">No statements found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {searchQuery
                        ? 'No statements match your search criteria'
                        : 'Upload your first bank statement to begin analytics'}
                    </p>
                    {!searchQuery && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 text-xs gap-1.5"
                        onClick={() => navigate('/upload')}
                      >
                        <UploadCloud className="h-3.5 w-3.5 text-primary" />
                        Upload Statement
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStatements.map((s) => {
                  const txnCount = s._count?.transactions ?? 0;
                  const isReprocessing = reprocessingId === s.id;

                  return (
                    <TableRow key={s.id} className="text-xs hover:bg-muted/30">
                      {/* Bank / Institution */}
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {s.bankName ? s.bankName.substring(0, 2).toUpperCase() : 'BK'}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-foreground truncate">
                              {s.bankName || 'Generic Bank'}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(s.uploadedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* File Name & Format */}
                      <TableCell>
                        <div className="truncate max-w-[180px]">
                          <p className="text-foreground truncate font-medium" title={s.fileName}>
                            {s.fileName.replace(/^.*[\\/]/, '')}
                          </p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-muted font-mono text-[9px] font-semibold text-muted-foreground uppercase">
                            {s.inputType}
                          </span>
                        </div>
                      </TableCell>

                      {/* Period Covered */}
                      <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {formatDateRange(s.statementPeriodStart, s.statementPeriodEnd)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(s.parseStatus)}</TableCell>

                      {/* Transaction Count */}
                      <TableCell className="text-center font-semibold text-foreground">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {txnCount}
                        </Badge>
                      </TableCell>

                      {/* Health Score */}
                      <TableCell>
                        {s.healthScore !== undefined && s.healthScore !== null ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.healthScore >= 80
                                    ? 'bg-emerald-500'
                                    : s.healthScore >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, s.healthScore)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] font-semibold text-foreground">
                              {s.healthScore.toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">N/A</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Transactions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Transactions"
                            className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => navigate(`/transactions?statementId=${s.id}`)}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">View</span>
                          </Button>

                          {/* Re-process / Reclassify */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Re-process classification"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/60"
                            disabled={isReprocessing}
                            onClick={() => handleReclassify(s.id, s.fileName)}
                          >
                            <RotateCw
                              className={`h-3.5 w-3.5 ${isReprocessing ? 'animate-spin text-primary' : ''}`}
                            />
                          </Button>

                          {/* Delete Statement */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Statement"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setStatementToDelete(s)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal Dialog */}
      {statementToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-destructive/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Confirm Statement Deletion</span>
                </div>
                <button
                  onClick={() => setStatementToDelete(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CardDescription className="text-xs pt-1">
                Are you sure you want to delete this statement?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 space-y-1.5">
                <p className="font-semibold text-foreground">
                  {statementToDelete.fileName.replace(/^.*[\\/]/, '')}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Bank: <span className="text-foreground font-medium">{statementToDelete.bankName || 'Generic'}</span> •
                  Transactions: <span className="text-foreground font-medium">{statementToDelete._count?.transactions ?? 0}</span>
                </p>
              </div>
              <p className="text-muted-foreground text-[11px]">
                <strong className="text-destructive font-semibold">Warning:</strong> Deleting this statement will permanently remove all associated parsed transactions, classifications, and audit logs. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setStatementToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={handleDeleteStatement}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? 'Deleting...' : 'Delete Statement'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
