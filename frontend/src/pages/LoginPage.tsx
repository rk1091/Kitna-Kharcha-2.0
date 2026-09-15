import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

    try {
      if (isRegisterMode) {
        await register(email, password, name || undefined);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Signed in successfully!');
      }
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Authentication failed. Please try again.';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-sm shadow-xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-2 shadow-sm">
            ₹
          </div>
          <CardTitle className="text-base font-bold">Kitna Kharcha 2.0</CardTitle>
          <CardDescription className="text-xs">
            {isRegisterMode ? 'Create a local private financial profile' : 'Privacy-First AI Financial Intelligence'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-9 text-xs font-medium mt-2" disabled={loading}>
              {loading
                ? isRegisterMode
                  ? 'Creating Account...'
                  : 'Signing In...'
                : isRegisterMode
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Local PII Protection Engine Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
