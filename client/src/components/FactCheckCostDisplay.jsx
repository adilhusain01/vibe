import { useMemo, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

const FactCheckCostDisplay = ({
  numParticipants,
  factsCount,
  rewardPerScore,
  onCostCalculated,
  disabled = false
}) => {
  const totalCost = useMemo(() => {
    if (!numParticipants || !factsCount || !rewardPerScore) {
      return 0;
    }
    return numParticipants * factsCount * rewardPerScore;
  }, [numParticipants, factsCount, rewardPerScore]);

  useEffect(() => {
    if (onCostCalculated) {
      onCostCalculated({ isValid: true, totalCost });
    }
  }, [totalCost]);

  const showCosts = totalCost > 0;

  if (disabled || !showCosts) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <DollarSign size={14} className="text-white md:hidden" />
        <DollarSign size={16} className="text-white hidden md:block" />
        <h3 className="text-white font-semibold text-sm md:text-base">Estimated Cost</h3>
      </div>

      {/* Simple Cost Calculation */}
      <div className="space-y-2 md:space-y-3">
        {/* Mobile: Stack calculation vertically */}
        <div className="block md:hidden">
          <div className="text-white/70 text-xs leading-relaxed">
            <div>{numParticipants} participants</div>
            <div>× {factsCount} facts</div>
            <div>× {rewardPerScore} STT</div>
          </div>
        </div>

        {/* Desktop: Show calculation inline */}
        <div className="hidden md:flex justify-between items-center text-sm">
          <span className="text-white/70">
            {numParticipants} participants × {factsCount} facts × {rewardPerScore} STT
          </span>
        </div>

        <div className="border-t border-white/10"></div>

        <div className="flex justify-between items-center">
          <span className="text-white font-semibold text-sm md:text-base">Total Fact Check Cost</span>
          <span className="text-white font-mono font-bold text-base md:text-lg">
            {totalCost.toFixed(4)} STT
          </span>
        </div>
      </div>
    </div>
  );
};

export default FactCheckCostDisplay;