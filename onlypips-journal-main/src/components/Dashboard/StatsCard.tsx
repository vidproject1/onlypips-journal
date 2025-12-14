
import React, { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`bg-background rounded-3xl border border-border/10 p-6 shadow-sm transform transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-light tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground font-light pt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
