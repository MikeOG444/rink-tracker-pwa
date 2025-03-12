import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LocationPermissionModal from '../location/LocationPermissionModal';
// Removed unused import
import { logger } from '../../services/logging';

// Local storage key for tracking onboarding completion
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';
const LOCATION_SETUP_COMPLETED_KEY = 'locationSetupCompleted';

interface OnboardingFlowProps {
  children: React.ReactNode;
}

/**
 * Component to manage the onboarding flow
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ children }) => {
  const { user } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Check if onboarding is completed
  const isOnboardingCompleted = (): boolean => {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  };
  
  // Check if location setup is completed
  const isLocationSetupCompleted = (): boolean => {
    return localStorage.getItem(LOCATION_SETUP_COMPLETED_KEY) === 'true';
  };
  
  // Mark onboarding as completed
  const markOnboardingCompleted = (): void => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  };
  
  // Mark location setup as completed
  const markLocationSetupCompleted = (): void => {
    localStorage.setItem(LOCATION_SETUP_COMPLETED_KEY, 'true');
  };
  
  // Handle permission granted
  const handlePermissionGranted = (): void => {
    logger.info('Location permission granted', 'OnboardingFlow');
    markLocationSetupCompleted();
    setShowLocationModal(false);
  };
  
  // Handle permission denied
  const handlePermissionDenied = (): void => {
    logger.info('Location permission denied', 'OnboardingFlow');
    markLocationSetupCompleted();
  };
  
  // Handle skip
  const handleSkip = (): void => {
    logger.info('Location setup skipped', 'OnboardingFlow');
    markLocationSetupCompleted();
  };
  
  // Check if we should show the location modal
  useEffect(() => {
    // Only show for authenticated users who haven't completed location setup
    if (user && !isLocationSetupCompleted() && !showLocationModal) {
      // Add a small delay to avoid showing the modal immediately after login
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, showLocationModal]);
  
  // Check if we should mark onboarding as completed
  useEffect(() => {
    if (user && isLocationSetupCompleted() && !isOnboardingCompleted()) {
      markOnboardingCompleted();
    }
  }, [user]);
  
  return (
    <>
      {children}
      
      <LocationPermissionModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onSkip={handleSkip}
      />
    </>
  );
};

export default OnboardingFlow;
