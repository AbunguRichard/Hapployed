import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Verification from '../components/Verification';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Verification />
      </div>
    </div>
  );
}
