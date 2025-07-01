import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Heart, ExternalLink } from 'lucide-react';
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

interface SupportModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({
  userId,
  isOpen,
  onClose,
  onDontShowAgain
}) => {
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  console.log('🎭 SupportModal render:', { isOpen, userId, affiliateInfo });

  useEffect(() => {
    console.log('🎭 SupportModal: useEffect triggered, isOpen:', isOpen);
    if (isOpen) {
      console.log('🎭 SupportModal: Fetching affiliate info');
      fetchAffiliateInfo();
    }
  }, [isOpen]);

  const fetchAffiliateInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_info')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        return;
      }

      setAffiliateInfo(data);
    } catch (error) {
      // Silent error handling for production
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

        // Close modal permanently
        onDontShowAgain();
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

  const handleClose = () => {
    onClose();
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('support_modal_dismissed_permanently', 'true');
    onDontShowAgain();
  };

  if (!affiliateInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="break-words">Support OnlyPips Journal</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Fallback Message */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                Support OnlyPips Journal by opening an account with our trusted broker partner. 
                Your support helps us keep this platform free and continuously improve our features.
              </p>
            </div>

            {/* Fallback Support Button */}
            <Button
              onClick={() => {
                localStorage.setItem('support_modal_fulfilled', 'true');
                onDontShowAgain();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">Support Us</span>
              </div>
            </Button>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-sm sm:text-base py-2 sm:py-3"
              >
                Close
              </Button>
              <Button
                variant="ghost"
                onClick={handleDontShowAgain}
                className="flex-1 text-sm sm:text-base py-2 sm:py-3 text-muted-foreground hover:text-foreground"
              >
                <span className="break-words">Don't show again</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="break-words">Support OnlyPips Journal</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Broker Logo */}
          {affiliateInfo.logo_url && (
            <div className="flex justify-center">
              <img
                src={affiliateInfo.logo_url}
                alt={affiliateInfo.broker_name}
                className="h-12 w-auto max-w-full object-contain sm:h-16"
                style={{ maxWidth: 'min(200px, 80vw)' }}
              />
            </div>
          )}

          {/* Support Message */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
              {affiliateInfo.message_body}
            </p>
          </div>

          {/* Support Button */}
          <Button
            onClick={handleSupportClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent flex-shrink-0" />
                <span className="break-words">Opening...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{affiliateInfo.button_label}</span>
              </div>
            )}
          </Button>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 text-sm sm:text-base py-2 sm:py-3"
            >
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={handleDontShowAgain}
              className="flex-1 text-sm sm:text-base py-2 sm:py-3 text-muted-foreground hover:text-foreground"
            >
              <span className="break-words">Don't show again</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal; 