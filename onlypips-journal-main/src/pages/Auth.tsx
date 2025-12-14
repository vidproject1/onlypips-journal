
import React, { useState } from 'react';
import AuthForm from '@/components/Auth/AuthForm';
import { TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthProps {
  onLogin: (userData: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
      onLogin(data);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to OnlyPips Journal!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Registration successful:", data);
      onLogin(data);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to OnlyPips Journal! Your account has been created.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-muted/30 border border-border/10 text-foreground mb-6">
          <TrendingUp className="mr-2 h-3.5 w-3.5" />
          <span className="text-xs font-medium tracking-wide uppercase">Track. Analyze. Improve.</span>
        </div>
        <h1 className="text-4xl font-light tracking-tight mb-3">OnlyPips Journal</h1>
        <p className="text-muted-foreground font-light text-lg">The trading journal for serious traders</p>
      </div>
      
      <AuthForm onLogin={handleLogin} onRegister={handleRegister} isLoading={isLoading} />
      
      <p className="mt-10 text-center text-xs text-muted-foreground font-light tracking-wide">
        By using this service, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Auth;
