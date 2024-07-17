import React, { useState, useEffect } from 'react';
import { XCircleIcon, LightBulbIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, BanknotesIcon, FireIcon } from '@heroicons/react/24/outline';

const HowItWorksPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenHowItWorksPopup');
    if (!hasSeenPopup) {
      setIsVisible(true);
      localStorage.setItem('hasSeenHowItWorksPopup', 'true');
    }
  }, []);

  if (!isVisible) return null;

  const steps = [
    { icon: <LightBulbIcon className="w-4 h-4" />, text: "Pick a coin you like" },
    { icon: <CurrencyDollarIcon className="w-4 h-4" />, text: "Buy on the bonding curve" },
    { icon: <ArrowTrendingUpIcon className="w-4 h-4" />, text: "Sell anytime for profits/losses" },
    { icon: <BanknotesIcon className="w-4 h-4" />, text: "Curve reaches 2500 BONE" },
    { icon: <FireIcon className="w-4 h-4" />, text: "BONE deposited in Uniswap & burned" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 max-w-md w-full mx-auto shadow-xl relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-blue-400 mb-3 neon-text text-center">How It Works</h2>
        <p className="text-gray-300 mb-4 text-center text-sm">
          Pump ensures safe, fair-launch tokens with no presale or team allocation.
        </p>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                {step.icon}
              </div>
              <p className="text-gray-300 text-sm">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPopup;