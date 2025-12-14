
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, isLoading = false }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLoginView) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (error) {
      // Error is handled in parent component
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm animate-fade-in">
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-2xl font-light tracking-tight">
            {isLoginView ? 'Welcome Back' : 'Join OnlyPips'}
          </h2>
          <p className="text-sm text-muted-foreground font-light">
            {isLoginView
              ? 'Enter your credentials to access your account'
              : 'Enter your information to create an account'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1">
                Email
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="rounded-xl border-border/20 h-11 bg-muted/20 focus-visible:ring-0 focus-visible:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium ml-1">
                Password
              </label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete={isLoginView ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="rounded-xl border-border/20 h-11 bg-muted/20 focus-visible:ring-0 focus-visible:border-primary/30"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full rounded-full h-11 font-normal text-base shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isLoginView ? 'Login' : 'Create Account'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLoginView(!isLoginView)}
              disabled={isLoading}
              className="rounded-full font-normal hover:bg-muted/50"
            >
              {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
