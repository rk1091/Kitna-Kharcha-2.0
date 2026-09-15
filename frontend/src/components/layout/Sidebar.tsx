import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Sliders,
  UploadCloud,
  RefreshCw,
  Wallet,
  Sparkles,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', to: '/transactions', icon: Receipt },
  { name: 'Statements', to: '/statements', icon: FileText },
  { name: 'Rules Engine', to: '/rules', icon: Sliders },
  { name: 'Upload Hub', to: '/upload', icon: UploadCloud },
  { name: 'Recurring & EMIs', to: '/recurring', icon: RefreshCw },
  { name: 'Budgets', to: '/budgets', icon: Wallet },
  { name: 'AI Insights', to: '/insights', icon: Sparkles, badge: 'AI' },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm font-bold text-lg tracking-tight">
            ₹
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-foreground text-sm flex items-center gap-1.5">
              Kitna Kharcha
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-primary/15 text-primary">
                2.0
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Privacy-First AI
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile & Status */}
      <div className="p-3 border-t border-border bg-card/40">
        <div className="p-2.5 rounded-lg bg-accent/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              U
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-foreground truncate">user@example.com</p>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                PII Mask Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
