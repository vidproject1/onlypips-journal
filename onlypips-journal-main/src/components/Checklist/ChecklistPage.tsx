
import React, { useState } from "react";
import StrategyList from "./StrategyList";
import StrategyChecklist from "./StrategyChecklist";
import MarketplaceDialog from "./MarketplaceDialog";

interface ChecklistPageProps {
  userId: string;
}

const ChecklistPage: React.FC<ChecklistPageProps> = ({ userId }) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChecklistPurchased = () => {
    // Refresh the strategy list to show newly purchased items
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Strategy Checklists</h1>
          <p className="text-muted-foreground text-sm font-light">
            Manage your trading strategies and execution checklists
          </p>
        </div>
        <MarketplaceDialog 
          userId={userId} 
          onChecklistPurchased={handleChecklistPurchased}
        />
      </div>
      
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <StrategyList 
            key={refreshKey}
            userId={userId} 
            selectedId={selectedId} 
            onStrategySelect={setSelectedId} 
          />
        </div>
        
        <div className="md:col-span-7 lg:col-span-8">
          {selectedId ? (
            <StrategyChecklist strategyId={selectedId} />
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/30 rounded-3xl bg-muted/5">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground/50"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15h6" />
                  <path d="M9 12h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground/80 mb-2">No Strategy Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a strategy from the list to view and manage its checklist items
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
