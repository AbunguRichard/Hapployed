import React, { useState } from 'react';
import AccountCreation from './AccountCreation';
import PathSelection from './PathSelection';
import LocalGigsProfile from './LocalGigsProfile';
import ProfessionalJobProfile from './ProfessionalJobProfile';
import ProfessionalProjectProfile from './ProfessionalProjectProfile';

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    account: {},
    path: null,
    profile: {}
  });

  // Step 1: Account Creation
  const handleAccountCreated = (accountData) => {
    setUserData(prev => ({ ...prev, account: accountData }));
    setCurrentStep(2);
  };

  // Step 2: Path Selection
  const handlePathSelected = (path) => {
    setUserData(prev => ({ ...prev, path }));
    setCurrentStep(3); // Move to appropriate profile builder
  };

  // Step 3: Profile Completion
  const handleProfileCompleted = (profileData) => {
    const completeUserData = {
      ...userData,
      profile: profileData
    };
    // Submit complete user data
    console.log('Complete user data:', completeUserData);
    // TODO: Submit to backend
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AccountCreation onComplete={handleAccountCreated} />;
      case 2:
        return <PathSelection onPathSelect={handlePathSelected} />;
      case 3:
        switch (userData.path) {
          case 'local_gigs':
            return <LocalGigsProfile onComplete={handleProfileCompleted} userData={userData} />;
          case 'professional_job':
            return <ProfessionalJobProfile onComplete={handleProfileCompleted} userData={userData} />;
          case 'professional_project':
            return <ProfessionalProjectProfile onComplete={handleProfileCompleted} userData={userData} />;
          default:
            return <PathSelection onPathSelect={handlePathSelected} />;
        }
      default:
        return <AccountCreation onComplete={handleAccountCreated} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderStep()}
    </div>
  );
};

export default SignupFlow;
