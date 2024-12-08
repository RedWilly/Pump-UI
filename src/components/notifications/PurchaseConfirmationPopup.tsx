import React, { useState } from 'react';
import { X as XIcon } from 'lucide-react';
import { parseUnits } from 'viem';

interface PurchaseConfirmationPopupProps {
  onConfirm: (amount: bigint) => void;
  onCancel: () => void;
  tokenSymbol: string;
}

const PurchaseConfirmationPopup: React.FC<PurchaseConfirmationPopupProps> = ({ onConfirm, onCancel, tokenSymbol }) => {
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const handleConfirm = () => {
    const amount = parseFloat(purchaseAmount);
    onConfirm(amount ? parseUnits(purchaseAmount, 18) : BigInt(0));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[var(--card)] p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
        <h2 className="text-sm font-bold text-white mb-2">How many {tokenSymbol} do you want to buy? - amount in Bone</h2>
        <p className="text-[10px] sm:text-xs text-gray-400 mb-3 italic leading-tight">
          Tip: It&apos;s optional, but buying a small amount helps protect your coin from snipers. 
          When creating, creators can buy up to 5% of the trading supply; any excess BONE is refunded.
        </p>
        <input
          type="number"
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(e.target.value)}
          className="w-full py-2 px-3 bg-[var(--card2)] border border-[var(--card-boarder)] rounded-md text-white mb-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
          placeholder={`0.0 (optional)`}
        />
        <div className="flex justify-end space-x-3 mb-3">
          <button 
            onClick={onCancel} 
            className="px-3 py-1.5 bg-[var(--card2)] text-white rounded-md text-xs sm:text-sm hover:bg-[var(--card-hover)] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-3 py-1.5 bg-[var(--primary)] text-black rounded-md text-xs sm:text-sm hover:bg-[var(--primary-hover)] transition-colors"
          >
            Confirm
          </button>
        </div>
        <p className="text-[8px] sm:text-xs text-gray-400 text-center">
          Cost to deploy: ~0 BONE
        </p>
      </div>
    </div>
  );
};

export default PurchaseConfirmationPopup;