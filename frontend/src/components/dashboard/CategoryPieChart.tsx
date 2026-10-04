import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface CategorySpendItem {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategorySpendItem[];
}

const PALETTE = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#64748B', // Slate
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-popover text-popover-foreground border border-border px-3 py-2 rounded-lg shadow-md text-xs">
        <p className="font-semibold">{item.name}</p>
        <p className="text-muted-foreground mt-0.5">
          ₹{Number(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const totalSpend = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">Spending by Category</CardTitle>
        <CardDescription className="text-xs">Expense allocation across classified categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full flex items-center justify-center">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="transparent"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-8">
              <p>No expense data in this period</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1">
                Upload bank statements or adjust date filter
              </p>
            </div>
          )}
        </div>

        {/* Categories Legend List */}
        {data.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {data.map((entry, idx) => {
              const pct = totalSpend > 0 ? ((entry.value / totalSpend) * 100).toFixed(1) : '0.0';
              return (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    />
                    <span className="text-foreground truncate">{entry.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">({pct}%)</span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0 ml-2">
                    ₹{entry.value.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
