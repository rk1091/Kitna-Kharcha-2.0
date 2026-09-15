import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  UploadCloud,
  Menu,
  X,
  FileText,
  Sliders,
  RefreshCw,
  Wallet,
  Sparkles,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  onOpenCopilot?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCopilot }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (to: string) => {
    navigate(to);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom Fixed Navigation Bar for Mobile (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-3 py-1 flex items-center justify-around select-none">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Receipt className="h-4 w-4 mb-0.5" />
          <span>Ledger</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <UploadCloud className="h-4 w-4 mb-0.5" />
          <span>Upload</span>
        </NavLink>

        {onOpenCopilot && (
          <button
            type="button"
            onClick={onOpenCopilot}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="h-4 w-4 mb-0.5 text-primary" />
            <span>Copilot</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </div>

      {/* Slide-out Drawer for Secondary Navigation */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-4/5 max-w-xs bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 p-4">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">Kitna Kharcha</h3>
                    <p className="text-[10px] text-muted-foreground">All Modules</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="py-4 space-y-1">
                {[
                  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
                  { name: 'Transactions Ledger', to: '/transactions', icon: Receipt },
                  { name: 'Bank Statements', to: '/statements', icon: FileText },
                  { name: 'Upload Hub', to: '/upload', icon: UploadCloud },
                  { name: 'Recurring & EMIs', to: '/recurring', icon: RefreshCw },
                  { name: 'Budgets Tracker', to: '/budgets', icon: Wallet },
                  { name: 'Proactive AI Insights', to: '/insights', icon: Sparkles },
                  { name: 'Rules Management', to: '/rules', icon: Sliders },
                  { name: 'Settings & Security', to: '/settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => handleNavClick(item.to)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted text-left transition-colors min-h-[44px]"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer with User Status & Logout */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="p-2.5 rounded-xl bg-muted/50 flex items-center justify-between text-xs">
                <div className="truncate">
                  <p className="font-semibold text-foreground truncate">{user?.email || 'User'}</p>
                  <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    PII Mask Active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
