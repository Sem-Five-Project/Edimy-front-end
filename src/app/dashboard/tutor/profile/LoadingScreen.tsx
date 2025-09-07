import React from "react";

interface LoadingScreenProps {}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
        </div>
        <p className="text-blue-600 font-medium">Loading your dashboard...</p>
        <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
