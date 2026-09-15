import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [currency, setCurrency] = useState('INR');

  const handleSave = () => {
    toast.success('Settings updated successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile & Currency Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            General & Currency Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Configure your primary reporting currency and base locale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Base Currency</label>
              <p className="text-[11px] text-muted-foreground">Multi-currency transactions convert to this currency for charts</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary w-40"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* PII Masking Security Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            Privacy & PII Masking Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            100% local deterministic redaction prior to AI evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">AES-256 Reversible Encryption</p>
              <p className="text-[11px] text-muted-foreground">Maps sensitive bank tokens back to viewable representations locally</p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Active
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-[10px]">Account Numbers: MASKED</Badge>
            <Badge variant="outline" className="text-[10px]">PAN & Aadhaar: MASKED</Badge>
            <Badge variant="outline" className="text-[10px]">UPI Handles: MASKED</Badge>
            <Badge variant="outline" className="text-[10px]">Email & Phones: MASKED</Badge>
            <Badge variant="outline" className="text-[10px]">Card Numbers: MASKED</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="sm" className="text-xs">
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
