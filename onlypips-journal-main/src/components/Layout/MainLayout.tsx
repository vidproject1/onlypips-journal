import React from 'react';
import NavBar from './NavBar';
import MigrationBanner from './MigrationBanner';
import SupportManager from '@/components/Support/SupportManager';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userId?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout, userId }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onLogout={onLogout} userId={userId} />
      {userId && <MigrationBanner userId={userId} />}
      <main className="flex-1 container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t border-white/10 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          OnlyPips Journal © {new Date().getFullYear()}
        </div>
      </footer>
      
      {/* Support Modal Manager - only render if user is authenticated */}
      {userId && <SupportManager userId={userId} />}
    </div>
  );
};

export default MainLayout;
