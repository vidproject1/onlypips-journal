
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const PublicNavBar = () => {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center font-bold text-lg mr-8">
            <img src="/OP logo.png" alt="OnlyPips Logo" className="mr-2 h-8 w-auto" />
            <span className="hidden md:inline">OnlyPips Journal</span>
            <span className="md:hidden">OnlyPips</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/blog" className="text-sm font-medium transition-colors hover:text-primary text-foreground/80">
              Blog
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button asChild variant="default" size="sm">
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Journal
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicNavBar;
