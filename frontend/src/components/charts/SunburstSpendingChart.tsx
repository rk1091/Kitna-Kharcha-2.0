import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SunburstMerchant {
  name: string;
  value: number;
}

export interface SunburstCategoryItem {
  name: string;
  value: number;
  color?: string;
  merchants: SunburstMerchant[];
}

interface SunburstSpendingChartProps {
  data: SunburstCategoryItem[];
  totalExpense?: number;
  onCategoryDrilldown?: (categoryName: string) => void;
}

const DEFAULT_PALETTE = [
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

// Helper to generate complementary tint for outer merchant slices
function getMerchantColor(baseColor: string, index: number, _total?: number): string {
  // Variations of opacity / brightness for outer ring
  const opacities = [0.85, 0.7, 0.55, 0.4, 0.3];
  const opacity = opacities[index % opacities.length];

  if (baseColor.startsWith('#') && baseColor.length === 7) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return baseColor;
}

interface FlattenedOuterItem {
  name: string;
  value: number;
  categoryName: string;
  categoryTotal: number;
  color: string;
}

export const SunburstSpendingChart: React.FC<SunburstSpendingChartProps> = ({
  data,
  totalExpense,
  onCategoryDrilldown,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const calculatedTotal = useMemo(() => {
    return totalExpense && totalExpense > 0
      ? totalExpense
      : data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data, totalExpense]);

  // If a category is selected, we focus on that category; otherwise all
  const activeData = useMemo(() => {
    if (!selectedCategory) return data;
    return data.filter((c) => c.name === selectedCategory);
  }, [data, selectedCategory]);

  // Inner ring: Categories
  const innerRingData = useMemo(() => {
    return activeData.map((cat, idx) => ({
      name: cat.name,
      value: cat.value,
      color: cat.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      merchantsCount: cat.merchants?.length || 0,
    }));
  }, [activeData]);

  // Outer ring: Merchants within categories
  const outerRingData = useMemo(() => {
    const flattened: FlattenedOuterItem[] = [];

    activeData.forEach((cat, catIdx) => {
      const baseColor = cat.color || DEFAULT_PALETTE[catIdx % DEFAULT_PALETTE.length];
      const merchants = cat.merchants || [];

      if (merchants.length === 0) {
        // Fallback placeholder slice
        flattened.push({
          name: `${cat.name} (Direct)`,
          value: cat.value,
          categoryName: cat.name,
          categoryTotal: cat.value,
          color: getMerchantColor(baseColor, 0, 1),
        });
      } else {
        merchants.forEach((m, mIdx) => {
          flattened.push({
            name: m.name,
            value: m.value,
            categoryName: cat.name,
            categoryTotal: cat.value,
            color: getMerchantColor(baseColor, mIdx, merchants.length),
          });
        });
      }
    });

    return flattened;
  }, [activeData]);

  const handleInnerClick = (entry: any) => {
    if (selectedCategory === entry.name) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(entry.name);
      if (onCategoryDrilldown) {
        onCategoryDrilldown(entry.name);
      }
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
  };

  // Custom multi-tier Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isOuter = 'categoryName' in item;

      const pctOfTotal =
        calculatedTotal > 0 ? ((item.value / calculatedTotal) * 100).toFixed(1) : '0';

      const pctOfCategory =
        isOuter && item.categoryTotal > 0
          ? ((item.value / item.categoryTotal) * 100).toFixed(1)
          : null;

      return (
        <div className="bg-popover/95 backdrop-blur-xs text-popover-foreground border border-border p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <p className="font-bold text-foreground text-xs">{item.name}</p>
          </div>

          {isOuter && (
            <p className="text-[11px] text-muted-foreground">
              Category: <strong className="text-foreground">{item.categoryName}</strong>
            </p>
          )}

          <p className="text-sm font-extrabold text-foreground pt-0.5">
            ₹{Number(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <span>{pctOfTotal}% of total spend</span>
            {pctOfCategory && <span>• {pctOfCategory}% of category</span>}
          </div>

          {!selectedCategory && !isOuter && (
            <p className="text-[9px] text-primary italic pt-0.5">Click to zoom into merchants</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-border bg-card overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Hierarchical Sunburst Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Inner ring: Categories • Outer ring: Top Merchants
          </CardDescription>
        </div>

        {selectedCategory && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs gap-1.5 font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Zoom</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full relative flex items-center justify-center">
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Inner Ring: Categories */}
                  <Pie
                    data={innerRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={selectedCategory ? 40 : 45}
                    outerRadius={selectedCategory ? 65 : 75}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handleInnerClick}
                    cursor="pointer"
                    stroke="transparent"
                  >
                    {innerRingData.map((entry, index) => (
                      <Cell
                        key={`inner-cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>

                  {/* Outer Ring: Merchants */}
                  <Pie
                    data={outerRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={selectedCategory ? 72 : 82}
                    outerRadius={selectedCategory ? 115 : 110}
                    paddingAngle={1}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {outerRingData.map((entry, index) => (
                      <Cell
                        key={`outer-cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total / Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {selectedCategory || 'Total Spend'}
                </span>
                <span className="text-xs font-bold text-foreground">
                  ₹
                  {Math.round(
                    selectedCategory
                      ? activeData[0]?.value || 0
                      : calculatedTotal,
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-10">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
              <p>No expense data available to construct sunburst</p>
            </div>
          )}
        </div>

        {/* Legend Pills */}
        {innerRingData.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border/50">
            {innerRingData.slice(0, 6).map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleInnerClick(cat)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  selectedCategory === cat.name
                    ? 'ring-2 ring-primary ring-offset-1 bg-accent text-foreground font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate max-w-[100px]">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
