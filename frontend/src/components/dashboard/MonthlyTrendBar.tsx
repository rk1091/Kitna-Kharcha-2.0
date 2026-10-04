import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface MonthlyTrendData {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendBarProps {
  data: MonthlyTrendData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border px-3 py-2 rounded-lg shadow-md text-xs space-y-1">
        <p className="font-semibold">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{item.name}:</span>
            <span className={`font-semibold ${item.dataKey === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
              ₹{Number(item.value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyTrendBar: React.FC<MonthlyTrendBarProps> = ({ data }) => {
  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">Monthly Cash Flow Trend</CardTitle>
        <CardDescription className="text-xs">Income vs Expense comparison across consecutive periods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
                  formatter={(value) => (
                    <span className="text-foreground capitalize font-medium">{value}</span>
                  )}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              <p>No monthly activity recorded yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
