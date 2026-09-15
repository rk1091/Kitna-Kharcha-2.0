import React, { useEffect, useState } from 'react';
import apiClient from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sliders, Search, Shield } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  categoryId: string;
  category?: { name: string };
  conditions: any;
  tags: string[];
  priority: number;
  isSystem: boolean;
  source: 'SYSTEM' | 'USER' | 'AI_LEARNED';
  hitCount: number;
}

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'SYSTEM' | 'USER' | 'AI_LEARNED'>('ALL');

  const fetchRules = () => {
    setLoading(true);
    apiClient
      .get('/classification/rules')
      .then((res) => {
        setRules(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback or empty if not yet exposed
        setRules([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = rules.filter((r) => {
    if (sourceFilter !== 'ALL' && r.source !== sourceFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.category && r.category.name.toLowerCase().includes(q)) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const formatConditions = (conditions: any) => {
    if (!conditions) return '—';
    const c = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
    const parts = [];
    if (c.descriptionContains) parts.push(`Contains "${c.descriptionContains}"`);
    if (c.keyword) parts.push(`Keyword "${c.keyword}"`);
    if (c.direction) parts.push(`Direction: ${c.direction}`);
    if (c.amountLessThan) parts.push(`< ₹${c.amountLessThan}`);
    if (c.amountGreaterThan) parts.push(`> ₹${c.amountGreaterThan}`);
    return parts.join(' • ') || JSON.stringify(c);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Tier 1 Compound Rules Engine</CardTitle>
              <CardDescription className="text-xs">
                Deterministic classification rules that process 80%+ of transactions instantly without AI costs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search rules, merchants, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
              <Button
                variant={sourceFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('ALL')}
                className="h-9 text-xs"
              >
                All
              </Button>
              <Button
                variant={sourceFilter === 'SYSTEM' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('SYSTEM')}
                className="h-9 text-xs"
              >
                System Default
              </Button>
              <Button
                variant={sourceFilter === 'USER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('USER')}
                className="h-9 text-xs"
              >
                User Defined
              </Button>
              <Button
                variant={sourceFilter === 'AI_LEARNED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('AI_LEARNED')}
                className="h-9 text-xs"
              >
                Auto-Learned
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[11px]">Rule Name</TableHead>
                <TableHead className="text-[11px]">Category</TableHead>
                <TableHead className="text-[11px]">Matching Conditions</TableHead>
                <TableHead className="text-[11px]">Source</TableHead>
                <TableHead className="text-[11px] text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading rules...
                  </TableCell>
                </TableRow>
              ) : filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <Sliders className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p>No rules found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{rule.name}</span>
                        {rule.isSystem && (
                          <span title="Protected System Rule">
                            <Shield className="h-3 w-3 text-primary" />
                          </span>
                        )}
                      </div>
                      {rule.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {rule.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {rule.category ? rule.category.name : 'Target Category'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {formatConditions(rule.conditions)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono capitalize"
                      >
                        {rule.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[11px]">
                      {rule.priority}
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
