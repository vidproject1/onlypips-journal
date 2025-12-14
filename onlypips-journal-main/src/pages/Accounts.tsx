import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import AccountList from "@/components/Accounts/AccountList";
import AddAccountDialog from "@/components/Accounts/AddAccountDialog";
import { Button } from "@/components/ui/button";

type Account = Database['public']['Tables']['accounts']['Row'];

interface AccountsPageProps {
  userId: string;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ userId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    console.log('Fetching accounts for user:', userId);
    setLoading(true);
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    console.log('Fetch accounts result:', { data, error });
    
    setAccounts(data || []);
    setLoading(false);
    
    if (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [userId, addOpen]);

  const handleAccountAdded = (account: Account) => {
    setAccounts((prev) => [...prev, account]);
    setAddOpen(false);
  };

  const handleAccountDeleted = (accountId: string) => {
    console.log('Handling account deletion in parent component:', accountId);
    setAccounts((prev) => prev.filter(acc => acc.id !== accountId));
    
    // Also refetch from database to ensure consistency
    setTimeout(() => {
      console.log('Refetching accounts after deletion');
      fetchAccounts();
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your trading accounts
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="rounded-full px-6">
          New Account
        </Button>
      </div>
      
      <AddAccountDialog 
        open={addOpen} 
        setOpen={setAddOpen} 
        userId={userId}
        onAccountAdded={handleAccountAdded}
      />

      {loading ? (
        <div className="py-12 text-center text-muted-foreground font-light">Loading...</div>
      ) : (
        <AccountList 
          accounts={accounts} 
          onAccountDeleted={handleAccountDeleted}
        />
      )}
    </div>
  );
};

export default AccountsPage;
