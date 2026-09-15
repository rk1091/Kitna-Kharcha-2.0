import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Trash2, HelpCircle } from 'lucide-react';

interface RawTextPasteProps {
  onImport: (text: string) => Promise<void>;
  isImporting: boolean;
}

const SAMPLE_TEXT = `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
01/01/2026,UPI-SWIGGY-BANGALORE-9876543210@paytm,,01/01/2026,450.00,,49550.00
03/01/2026,SALARY CREDIT - TECH CORP PVT LTD,,03/01/2026,,85000.00,134550.00
05/01/2026,NETFLIX.COM INTERNET MUMBAI,,05/01/2026,649.00,,133901.00
07/01/2026,UPI-UBER RIDES-BANGALORE-1234567890@icici,,07/01/2026,320.00,,133581.00
10/01/2026,AMAZON PAY INDIA MUMBAI,,10/01/2026,1299.00,,132282.00`;

export const RawTextPaste: React.FC<RawTextPasteProps> = ({ onImport, isImporting }) => {
  const [text, setText] = useState('');

  const lines = text.trim() ? text.trim().split(/\r?\n/).length : 0;
  const characters = text.length;

  const handleImport = async () => {
    if (!text.trim()) return;
    await onImport(text.trim());
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Paste Statement Text
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setText(SAMPLE_TEXT)}
              disabled={isImporting}
              className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
            >
              <HelpCircle className="h-3 w-3" />
              Load Sample Text
            </Button>
            {text && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setText('')}
                disabled={isImporting}
                className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste text directly from netbanking, bank emails, or plain text export here...
Example:
01/01/2026  UPI-SWIGGY-12345@paytm  450.00  Dr`}
          disabled={isImporting}
          className="w-full rounded-xl border border-border bg-card p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <div>
            <span>{lines} lines</span> • <span>{characters} characters</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            All text is passed directly through client PII sanitization before tiered parsing.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-1">
        <Button
          size="sm"
          onClick={handleImport}
          disabled={isImporting || !text.trim()}
          className="h-9 px-5 text-xs font-semibold gap-2 shadow-sm"
        >
          <CheckCircle className="h-4 w-4" />
          {isImporting ? 'Ingesting Statement...' : 'Import Statement Text'}
        </Button>
      </div>
    </div>
  );
};
