import React, { useState, useEffect } from 'react';
import apiClient from '@/config/api';
import { SubscriptionAuditBanner } from '@/components/recurring/SubscriptionAuditBanner';
import { RecurringCard, RecurringGroupItem } from '@/components/recurring/RecurringCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Layers } from 'lucide-react';

export const RecurringPage: React.FC = () => {
  const [groups, setGroups] = useState<RecurringGroupItem[]>([]);
  const [summary, setSummary] = useState({
    totalMonthlyCommitment: 0,
    activeCount: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const fetchRecurring = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/recurring');
      setGroups(res.data.groups || []);
      setSummary(res.data.summary || {
        totalMonthlyCommitment: 0,
        activeCount: 0,
        totalCount: 0,
      });
    } catch {
      toast.error('Failed to load recurring commitments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleRunScan = async () => {
    try {
      setIsScanning(true);
      const res = await apiClient.post('/recurring/detect');
      setGroups(res.data.groups || []);
      setSummary(res.data.summary || {
        totalMonthlyCommitment: 0,
        activeCount: 0,
        totalCount: 0,
      });
      toast.success('Recurring scan completed! Identified subscriptions and periodic commitments.');
    } catch {
      toast.error('Failed to run recurring detection scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setTogglingId(id);
      const res = await apiClient.patch(`/recurring/${id}/toggle`);
      const updated = res.data;
      setGroups(prev => prev.map(g => (g.id === id ? { ...g, isActive: updated.isActive } : g)));

      // Re-fetch summary
      const refresh = await apiClient.get('/recurring');
      setSummary(refresh.data.summary);
      toast.success(updated.isActive ? 'Recurring commitment marked active' : 'Recurring commitment paused');
    } catch {
      toast.error('Failed to update recurring status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredGroups = groups.filter(g => {
    if (selectedFilter === 'ALL') return true;
    return g.type === selectedFilter;
  });

  const filterOptions = [
    { label: 'All Items', value: 'ALL', count: groups.length },
    { label: 'Subscriptions', value: 'SUBSCRIPTION', count: groups.filter(g => g.type === 'SUBSCRIPTION').length },
    { label: 'Utilities', value: 'UTILITY', count: groups.filter(g => g.type === 'UTILITY').length },
    { label: 'EMIs & Loans', value: 'EMI', count: groups.filter(g => g.type === 'EMI').length },
    { label: 'Regular', value: 'REGULAR_EXPENSE', count: groups.filter(g => g.type === 'REGULAR_EXPENSE').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <SubscriptionAuditBanner
        totalMonthlyCommitment={summary.totalMonthlyCommitment}
        activeCount={summary.activeCount}
        totalCount={summary.totalCount}
        onRunScan={handleRunScan}
        isScanning={isScanning}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        {filterOptions.map(opt => (
          <Button
            key={opt.value}
            variant={selectedFilter === opt.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedFilter(opt.value)}
            className="text-xs h-8 px-3 rounded-full"
          >
            {opt.label} ({opt.count})
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Scanning recurring cadence and subscriptions...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] border border-dashed rounded-xl p-8 text-center space-y-3 bg-muted/20">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No recurring items found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Upload multi-month bank statements or run a detection scan to identify recurring subscriptions, utilities, and EMIs.
            </p>
          </div>
          <Button size="sm" onClick={handleRunScan} disabled={isScanning} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            Run Recurring Detection Scan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGroups.map(item => (
            <RecurringCard
              key={item.id}
              item={item}
              onToggle={handleToggle}
              isToggling={togglingId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
