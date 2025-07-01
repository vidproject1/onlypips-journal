import React from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Account = Database['public']['Tables']['accounts']['Row'];

interface Props {
  accounts: Account[];
  onAccountDeleted: (accountId: string) => void;
}

const AccountList: React.FC<Props> = ({ accounts, onAccountDeleted }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    // Check for a valid session before attempting delete
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Current session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      accountId,
      accountName
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      toast({
        title: "Authentication Error",
        description: "There was a problem checking your login status. Please try logging in again.",
        variant: "destructive"
      })
      return
    }

    if (!session || !session.user) {
      console.error('No valid session found')
      toast({
        title: "Not authenticated",
        description: "You must be logged in to delete an account. Please log in and try again.",
        variant: "destructive"
      })
      return
    }

    try {
      // First verify the account belongs to the user
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('user_id, id')
        .eq('id', accountId)
        .single()

      if (accountError) {
        console.error('Error verifying account ownership:', accountError)
        toast({
          title: "Error",
          description: "Could not verify account ownership. Please try again.",
          variant: "destructive"
        })
        return
      }

      if (accountData.user_id !== session.user.id) {
        console.error('Account ownership mismatch:', {
          accountUserId: accountData.user_id,
          sessionUserId: session.user.id
        })
        toast({
          title: "Permission Denied",
          description: "You do not have permission to delete this account.",
          variant: "destructive"
        })
        return
      }

      // First delete all associated trades
      const { error: tradesDeleteError } = await supabase
        .from('trades')
        .delete()
        .eq('account_id', accountId)

      if (tradesDeleteError) {
        console.error('Error deleting associated trades:', tradesDeleteError)
        toast({
          title: "Error",
          description: "Could not delete associated trades. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Now proceed with account deletion
      const { error: deleteError, data: deleteData } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', session.user.id)
        .select()

      if (deleteError) {
        console.error('Delete error details:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint
        })
        toast({
          title: "Error",
          description: deleteError.message || "Failed to delete account. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Check if any rows were actually deleted
      if (!deleteData || deleteData.length === 0) {
        console.warn('No rows were deleted:', {
          accountId,
          userId: session.user.id
        })
        toast({
          title: "Warning",
          description: "Account may have already been deleted or you may not have permission.",
          variant: "destructive",
        })
        return
      }

      console.log('Account and associated trades successfully deleted:', {
        accountId,
        deletedData: deleteData
      })

      toast({
        title: "Account deleted",
        description: `Account "${accountName}" and all associated trades have been deleted successfully.`,
      })

      // Update the local state
      onAccountDeleted(accountId)

    } catch (error) {
      console.error('Unexpected error during deletion:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  };

  if (!accounts.length) {
    return (
      <div className="text-center text-muted-foreground">
        No accounts yet. Get started by adding a new account!
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      {accounts.map((acc) => (
        <Card 
          key={acc.id} 
          className="p-4 flex justify-between items-center hover:bg-muted/50 transition"
        >
          <div 
            className="flex-1 cursor-pointer"
            onClick={() =>
              navigate(`/dashboard/${acc.type.toLowerCase()}/${encodeURIComponent(acc.name)}`)
            }
          >
            <div className="font-semibold">{acc.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{acc.type}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/${acc.type.toLowerCase()}/${encodeURIComponent(acc.name)}`)
              }
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the account "{acc.name}"? This action cannot be undone and will permanently remove the account and all associated trades.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteAccount(acc.id, acc.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AccountList;
