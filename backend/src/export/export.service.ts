import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

export interface ExportFilters {
  from?: string;
  to?: string;
  categoryId?: string;
}

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  private escapeCSVField(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async exportCSV(userId: string, filters: ExportFilters = {}): Promise<string> {
    const where: any = {
      statement: { userId },
    };

    if (filters.from || filters.to) {
      where.txnDate = {};
      if (filters.from) where.txnDate.gte = new Date(filters.from);
      if (filters.to) where.txnDate.lte = new Date(filters.to);
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const txns = await this.prisma.transaction.findMany({
      where,
      orderBy: { txnDate: 'desc' },
      include: {
        category: true,
        statement: true,
      },
    });

    const headers = [
      'Date',
      'Description',
      'Normalized Merchant',
      'Category',
      'Tags',
      'Direction',
      'Amount',
      'Currency',
      'Bank',
    ];

    const rows: string[] = [headers.join(',')];

    for (const t of txns) {
      const amount =
        t.direction === 'DEBIT'
          ? (t.debitAmount ? Number(t.debitAmount) : Math.abs(Number(t.amountSigned)))
          : (t.creditAmount ? Number(t.creditAmount) : Number(t.amountSigned));

      const row = [
        this.escapeCSVField(t.txnDate ? new Date(t.txnDate).toISOString().split('T')[0] : ''),
        this.escapeCSVField(t.description),
        this.escapeCSVField(t.normalizedDescription),
        this.escapeCSVField(t.category?.name || 'Uncategorized'),
        this.escapeCSVField(t.tags?.join('; ') || ''),
        this.escapeCSVField(t.direction),
        this.escapeCSVField(amount.toFixed(2)),
        this.escapeCSVField(t.currency || 'INR'),
        this.escapeCSVField(t.statement?.bankName || 'Unknown Bank'),
      ];
      rows.push(row.join(','));
    }

    return rows.join('\r\n');
  }

  async exportExcel(userId: string, filters: ExportFilters = {}): Promise<Buffer> {
    const where: any = {
      statement: { userId },
    };

    if (filters.from || filters.to) {
      where.txnDate = {};
      if (filters.from) where.txnDate.gte = new Date(filters.from);
      if (filters.to) where.txnDate.lte = new Date(filters.to);
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const txns = await this.prisma.transaction.findMany({
      where,
      orderBy: { txnDate: 'desc' },
      include: {
        category: true,
        statement: true,
      },
    });

    const data = txns.map((t) => {
      const amount =
        t.direction === 'DEBIT'
          ? (t.debitAmount ? Number(t.debitAmount) : Math.abs(Number(t.amountSigned)))
          : (t.creditAmount ? Number(t.creditAmount) : Number(t.amountSigned));

      return {
        Date: t.txnDate ? new Date(t.txnDate).toISOString().split('T')[0] : '',
        Description: t.description,
        'Normalized Merchant': t.normalizedDescription,
        Category: t.category?.name || 'Uncategorized',
        Tags: t.tags?.join('; ') || '',
        Direction: t.direction,
        Amount: amount,
        Currency: t.currency || 'INR',
        Bank: t.statement?.bankName || 'Unknown Bank',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportExecutiveReport(userId: string, filters: ExportFilters = {}): Promise<string> {
    const where: any = {
      statement: { userId },
    };

    if (filters.from || filters.to) {
      where.txnDate = {};
      if (filters.from) where.txnDate.gte = new Date(filters.from);
      if (filters.to) where.txnDate.lte = new Date(filters.to);
    }

    const [txns, recurring] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
      }),
      this.prisma.recurringGroup.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    let totalExpense = 0;
    let totalIncome = 0;
    const categoryMap: Record<string, number> = {};
    const merchantMap: Record<string, number> = {};

    for (const t of txns) {
      const amt = Math.abs(Number(t.amountSigned));
      if (t.direction === 'DEBIT') {
        totalExpense += amt;
        const cat = t.category?.name || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;

        const merch = t.normalizedDescription || 'Unknown Merchant';
        merchantMap[merch] = (merchantMap[merch] || 0) + amt;
      } else {
        totalIncome += amt;
      }
    }

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

    const sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const sortedMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const recurringTotal = recurring.reduce((acc, r) => acc + Number(r.avgAmount), 0);

    const reportDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kitna Kharcha — Financial Executive Summary</title>
  <style>
    @page { margin: 15mm; size: A4 portrait; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .badge {
      font-size: 11px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      margin-top: 4px;
    }
    .val-rose { color: #e11d48; }
    .val-emerald { color: #059669; }
    .val-indigo { color: #4f46e5; }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 32px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Kitna Kharcha 2.0</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
        Financial Executive Summary & Analytical Report
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Generated: ${reportDate}</span>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
        Transactions Analyzed: <strong>${txns.length}</strong>
      </div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Outflow</div>
      <div class="kpi-val val-rose">₹${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Inflow</div>
      <div class="kpi-val val-emerald">₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Net Cash Flow</div>
      <div class="kpi-val ${netSavings >= 0 ? 'val-emerald' : 'val-rose'}">
        ₹${netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Savings Rate</div>
      <div class="kpi-val val-indigo">${savingsRate}%</div>
    </div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-title">Top Spending Categories</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th class="num">Spent</th>
            <th class="num">% Total</th>
          </tr>
        </thead>
        <tbody>
          ${sortedCategories
            .map(([cat, amt]) => {
              const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0.0';
              return `<tr>
                <td style="font-weight: 600;">${cat}</td>
                <td class="num">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="num" style="color: #64748b;">${pct}%</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <div>
      <div class="section-title">Top Merchant Outflows</div>
      <table>
        <thead>
          <tr>
            <th>Merchant</th>
            <th class="num">Spent</th>
            <th class="num">% Total</th>
          </tr>
        </thead>
        <tbody>
          ${sortedMerchants
            .map(([merch, amt]) => {
              const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0.0';
              return `<tr>
                <td style="font-weight: 600;">${merch}</td>
                <td class="num">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="num" style="color: #64748b;">${pct}%</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="kpi-card" style="margin-bottom: 24px;">
    <div class="section-title" style="margin-bottom: 8px;">Active Recurring Commitments</div>
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
      <span><strong>${recurring.length}</strong> active recurring subscriptions & EMIs tracked</span>
      <span>Monthly Commitment: <strong class="val-indigo">₹${recurringTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
    </div>
  </div>

  <div class="footer">
    <div>Kitna Kharcha 2.0 • Privacy-First Financial Intelligence • Local Deterministic PII Sanitized</div>
    <div>Report automatically compiled from verified financial ledgers</div>
  </div>
</body>
</html>`;
  }
}
