import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Shield, Sparkles, User, Sliders } from 'lucide-react';

export interface ClassificationRuleItem {
  id: string;
  userId?: string | null;
  name: string;
  conditions: any;
  categoryId: string;
  category?: { id: string; name: string };
  tags: string[];
  priority: number;
  isActive: boolean;
  isSystem: boolean;
  source: 'SYSTEM' | 'USER' | 'AI_LEARNED';
  hitCount: number;
  createdAt: string;
}

interface RulesTableProps {
  rules: ClassificationRuleItem[];
  loading: boolean;
  onEdit: (rule: ClassificationRuleItem) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentState: boolean) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const formatConditions = (conditions: any) => {
    if (!conditions) return '—';
    const c = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;

    const parts: string[] = [];

    if (c.operator && c.value) {
      const field = c.field === 'description' ? 'raw description' : 'merchant';
      parts.push(`${field} ${c.operator} "${c.value}"`);
    } else {
      if (c.normalizedMerchantContains) parts.push(`merchant contains "${c.normalizedMerchantContains}"`);
      if (c.descriptionContains) parts.push(`desc contains "${c.descriptionContains}"`);
      if (c.keyword) parts.push(`keyword "${c.keyword}"`);
    }

    if (c.direction) parts.push(`dir: ${c.direction}`);
    if (c.amountLessThan !== undefined) parts.push(`< ₹${c.amountLessThan}`);
    if (c.amountGreaterThan !== undefined) parts.push(`> ₹${c.amountGreaterThan}`);

    return parts.join(' • ') || JSON.stringify(c);
  };

  const getSourceBadge = (source: string, isSystem: boolean) => {
    if (isSystem || source === 'SYSTEM') {
      return (
        <Badge
          variant="secondary"
          className="gap-1 text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-blue-500/20"
        >
          <Shield className="h-2.5 w-2.5" />
          SYSTEM
        </Badge>
      );
    }
    if (source === 'AI_LEARNED') {
      return (
        <Badge
          variant="secondary"
          className="gap-1 text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border-purple-500/20"
        >
          <Sparkles className="h-2.5 w-2.5" />
          AI_LEARNED
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-emerald-500/20"
      >
        <User className="h-2.5 w-2.5" />
        USER
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-12 text-center text-[11px] font-semibold">Active</TableHead>
            <TableHead className="text-[11px] font-semibold">Rule Name</TableHead>
            <TableHead className="text-[11px] font-semibold">Matching Criteria</TableHead>
            <TableHead className="text-[11px] font-semibold">Target Category</TableHead>
            <TableHead className="text-[11px] font-semibold">Source</TableHead>
            <TableHead className="text-[11px] font-semibold text-center">Hits</TableHead>
            <TableHead className="text-[11px] font-semibold text-right">Priority</TableHead>
            <TableHead className="text-[11px] font-semibold text-right w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-40 text-center text-xs text-muted-foreground">
                Loading classification rules...
              </TableCell>
            </TableRow>
          ) : rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-40 text-center text-xs text-muted-foreground">
                <Sliders className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground">No classification rules found</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Create a custom rule or import seed rules
                </p>
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => {
              const isUserRule = !rule.isSystem && rule.source !== 'SYSTEM';

              return (
                <TableRow
                  key={rule.id}
                  className={`text-xs transition-colors ${
                    !rule.isActive ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Active Toggle Switch */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      disabled={!isUserRule}
                      onChange={() => onToggleActive(rule.id, rule.isActive)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                      title={isUserRule ? 'Toggle rule active state' : 'System rules are permanently active'}
                    />
                  </TableCell>

                  {/* Rule Name & Tags */}
                  <TableCell className="font-semibold text-foreground">
                    <div className="max-w-[200px] truncate">
                      <p className="truncate text-foreground font-medium">{rule.name}</p>
                      {rule.tags && rule.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {rule.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Matching Criteria */}
                  <TableCell className="font-mono text-[11px] text-muted-foreground max-w-[240px] truncate">
                    {formatConditions(rule.conditions)}
                  </TableCell>

                  {/* Target Category */}
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {rule.category ? rule.category.name : 'Target Category'}
                    </Badge>
                  </TableCell>

                  {/* Source Badge */}
                  <TableCell>{getSourceBadge(rule.source, rule.isSystem)}</TableCell>

                  {/* Hit Count */}
                  <TableCell className="text-center font-mono">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {rule.hitCount || 0}
                    </Badge>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="text-right font-mono font-semibold text-foreground">
                    {rule.priority}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {isUserRule ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(rule)}
                          title="Edit Rule"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(rule.id)}
                          title="Delete Rule"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic pr-2">Protected</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
