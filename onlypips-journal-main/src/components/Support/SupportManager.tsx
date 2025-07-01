import React, { useState, useEffect, useCallback } from 'react';
import SupportModal from './SupportModal';
import { supabase } from '@/integrations/supabase/client';

interface SupportManagerProps {
  userId: string;
}

const SupportManager: React.FC<SupportManagerProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasActiveAffiliate, setHasActiveAffiliate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSupportModalConditions = useCallback(async () => {
    console.log('🔍 SupportManager: Starting check for userId:', userId);
    
    if (!userId) {
      console.log('❌ SupportManager: No userId provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Step 1: Check localStorage for permanent dismissal
      const dismissedPermanently = localStorage.getItem('support_modal_dismissed_permanently') === 'true';
      console.log('🔍 SupportManager: dismissedPermanently:', dismissedPermanently);
      if (dismissedPermanently) {
        console.log('❌ SupportManager: Modal dismissed permanently');
        setIsLoading(false);
        return;
      }

      // Step 2: Check localStorage for fulfilled status (user clicked affiliate link)
      const fulfilled = localStorage.getItem('support_modal_fulfilled') === 'true';
      console.log('🔍 SupportManager: fulfilled:', fulfilled);
      if (fulfilled) {
        console.log('❌ SupportManager: User has fulfilled support request');
        setIsLoading(false);
        return;
      }

      // Step 3: Check localStorage for recent dismissal (within 3 days)
      const lastClosed = localStorage.getItem('support_modal_last_closed');
      console.log('🔍 SupportManager: lastClosed:', lastClosed);
      if (lastClosed) {
        const now = new Date().getTime();
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        const timeSinceLastClosed = now - parseInt(lastClosed);
        const daysSinceClosed = timeSinceLastClosed / (24 * 60 * 60 * 1000);
        
        console.log('🔍 SupportManager: daysSinceClosed:', daysSinceClosed);
        if (timeSinceLastClosed < threeDaysInMs) {
          console.log('❌ SupportManager: Modal closed recently, not showing');
          setIsLoading(false);
          return;
        }
      }

      // Step 4: Check database for user support status (legacy check)
      console.log('🔍 SupportManager: Checking database for user support status');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_supported')
        .eq('id', userId)
        .single();

      if (userError) {
        console.log('⚠️ SupportManager: Database error, continuing:', userError.message);
        // Continue with modal check even if database check fails
      } else {
        console.log('🔍 SupportManager: userData.has_supported:', userData?.has_supported);
        if (userData?.has_supported) {
          console.log('❌ SupportManager: User has supported according to database');
          localStorage.setItem('support_modal_fulfilled', 'true');
          setIsLoading(false);
          return;
        }
      }

      // Step 5: Check if there's an active affiliate
      console.log('🔍 SupportManager: Checking for active affiliate');
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliate_info')
        .select('*')
        .eq('active', true)
        .single();

      if (affiliateError) {
        console.log('⚠️ SupportManager: Affiliate error:', affiliateError.message);
      }

      if (!affiliateData) {
        console.log('❌ SupportManager: No active affiliate found');
        setHasActiveAffiliate(false);
        setIsLoading(false);
        return;
      }

      console.log('✅ SupportManager: Active affiliate found:', affiliateData.broker_name);
      setHasActiveAffiliate(true);
      setShowModal(true);
      console.log('🎉 SupportManager: Modal should now be visible!');
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 SupportManager: Unexpected error:', error);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkSupportModalConditions();
  }, [checkSupportModalConditions]);

  const handleCloseModal = () => {
    setShowModal(false);
    // Store timestamp when modal was closed
    localStorage.setItem('support_modal_last_closed', new Date().getTime().toString());
  };

  const handleDontShowAgain = () => {
    setShowModal(false);
    localStorage.setItem('support_modal_dismissed_permanently', 'true');
  };

  // Don't render anything if still loading or no active affiliate
  if (isLoading || !hasActiveAffiliate) {
    console.log('🚫 SupportManager: Not rendering modal - loading:', isLoading, 'hasActiveAffiliate:', hasActiveAffiliate);
    return null;
  }

  console.log('🎯 SupportManager: Rendering SupportModal with isOpen:', showModal);
  return (
    <SupportModal
      userId={userId}
      isOpen={showModal}
      onClose={handleCloseModal}
      onDontShowAgain={handleDontShowAgain}
    />
  );
};

export default SupportManager; 