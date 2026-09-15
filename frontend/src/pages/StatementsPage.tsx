import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, UploadCloud, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface StatementUpload {
  id: string;
  filename?: string;
  inputType: string;
  parseStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  healthScore?: number;
  contentFingerprint?: string;
  createdAt: string;
  _count?: {
    transactions: number;
  };
}

export const StatementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statements, setStatements] = useState<StatementUpload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatements = () => {
    setLoading(true);
    apiClient
      .get('/statements')
      .then((res) => {
        setStatements(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
            <CheckCircle2 className="h-3 w-3" />
            Parsed
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 animate-pulse">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Statements Management</CardTitle>
            <CardDescription className="text-xs">
              Audit log of bank statement uploads, fingerprint dedup, and parsing health scores
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchStatements} className="h-8 gap-2 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate('/upload')} className="h-8 gap-2 text-xs">
              <UploadCloud className="h-3.5 w-3.5" />
              Upload New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[11px]">Uploaded Date</TableHead>
                <TableHead className="text-[11px]">Format / Input</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Health Score</TableHead>
                <TableHead className="text-[11px] hidden md:table-cell">Fingerprint</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading statement records...
                  </TableCell>
                </TableRow>
              ) : statements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p>No statements uploaded yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                statements.map((s) => (
                  <TableRow key={s.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="text-muted-foreground text-[11px]">
                      {new Date(s.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted font-mono text-[10px]">
                        {s.inputType}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(s.parseStatus)}</TableCell>
                    <TableCell>
                      {s.healthScore !== undefined && s.healthScore !== null ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, s.healthScore)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold">{s.healthScore}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                      {s.contentFingerprint || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
