import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UploadCloud, ShieldCheck } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [submittingPaste, setSubmittingPaste] = useState(false);

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    toast.promise(
      apiClient.post('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: `Masking PII & uploading ${file.name}...`,
        success: () => {
          setUploading(false);
          setTimeout(() => navigate('/statements'), 1200);
          return 'Uploaded! Masking completed. AI pipeline is categorizing.';
        },
        error: (err: any) => {
          setUploading(false);
          return err?.response?.data?.message || 'Failed to upload statement.';
        },
      },
    );
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      toast.error('Please paste transaction text first');
      return;
    }

    setSubmittingPaste(true);
    try {
      await apiClient.post('/ingestion/text', { text: pasteText });
      toast.success('Pasted text ingested and sent to classification pipeline!');
      setPasteText('');
      setTimeout(() => navigate('/transactions'), 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to ingest text');
    } finally {
      setSubmittingPaste(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-foreground">Zero Raw PII Leaves Your Machine</p>
          <p className="text-muted-foreground mt-0.5">
            10+ regex masking strategies strip account numbers, IFSC codes, PAN, Aadhaar, phone numbers, and UPI handles before classification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Dropzone */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Statement File Upload</CardTitle>
            <CardDescription className="text-xs">PDF, CSV, Excel (.xlsx, .xls) bank statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  handleUploadFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadFile(e.target.files[0]);
                  }
                }}
              />

              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>

              <p className="text-xs font-semibold text-foreground">
                {uploading ? 'Uploading & Masking...' : 'Click or drag bank statement here'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Supports PDF, CSV, Excel, TXT</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="secondary" className="text-[10px]">HDFC</Badge>
                <Badge variant="secondary" className="text-[10px]">SBI</Badge>
                <Badge variant="secondary" className="text-[10px]">ICICI</Badge>
                <Badge variant="secondary" className="text-[10px]">Axis</Badge>
                <Badge variant="secondary" className="text-[10px]">Universal LLM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copy-Paste Text Area */}
        <Card className="shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Copy-Paste Ingestion</CardTitle>
            <CardDescription className="text-xs">Paste SMS alerts, email receipts, or text statement rows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste raw bank SMS or statement table rows here...
e.g. Sent Rs.450 to Swiggy UPI via HDFC Bank on 14-Sep-26"
              className="w-full flex-1 min-h-[160px] p-3 text-xs bg-muted/40 border border-border rounded-xl font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <Button
              onClick={handlePasteSubmit}
              disabled={submittingPaste || !pasteText.trim()}
              className="w-full text-xs font-medium h-9"
            >
              {submittingPaste ? 'Processing Text...' : 'Parse Pasted Text'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
