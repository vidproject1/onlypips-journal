
import React from 'react';
import PublicNavBar from './PublicNavBar';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavBar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <div className="mb-4">
            <img src="/OP logo.png" alt="OnlyPips Logo" className="h-6 w-auto mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
          </div>
          <p>&copy; {new Date().getFullYear()} OnlyPips Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
