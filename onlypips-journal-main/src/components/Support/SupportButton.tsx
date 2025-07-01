import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliateInfo {
  id: string;
  broker_name: string;
  link: string;
  logo_url: string;
  message_body: string;
  button_label: string;
  active: boolean;
}

interface SupportButtonProps {
  userId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'lg';
}

const SupportButton: React.FC<SupportButtonProps> = ({
  userId,
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliateInfo();
  }, []);

  const fetchAffiliateInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_info')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error fetching affiliate info:', error);
        return;
      }

      setAffiliateInfo(data);
    } catch (error) {
      console.error('Error fetching affiliate info:', error);
    }
  };

  const handleSupportClick = async () => {
    if (!affiliateInfo) return;

    setIsLoading(true);
    try {
      // Open affiliate link in new tab
      window.open(affiliateInfo.link, '_blank');

      // Update user's has_supported field
      const { error } = await supabase
        .from('users')
        .update({ has_supported: true })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user support status:', error);
        toast({
          title: "Error",
          description: "Failed to update support status",
          variant: "destructive"
        });
      } else {
        // Store flag in localStorage
        localStorage.setItem('support_modal_fulfilled', 'true');
        
        toast({
          title: "Thank you!",
          description: "Your support means a lot to us!",
        });
      }
    } catch (error) {
      console.error('Error handling support click:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no active affiliate info
  if (!affiliateInfo) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSupportClick}
      disabled={isLoading}
      className={`${className} transition-all duration-200 hover:scale-105`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="hidden sm:inline">Opening...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Heart className="h-3 w-3 text-red-500" />
          <span className="hidden sm:inline">Support Us</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      )}
    </Button>
  );
};

export default SupportButton; 