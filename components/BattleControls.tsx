"use client";

interface BattleControlsProps {
  onNextMove: () => void;
  onToggleAutoBattle: () => void;
  onRestartBattle: () => void;
  isAutoBattling: boolean;
}

export default function BattleControls({ 
  onNextMove, 
  onToggleAutoBattle, 
  onRestartBattle,
  isAutoBattling
}: BattleControlsProps) {
  return (
    <div className="battle-controls">
      <button 
        id="next-move"
        className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={onNextMove}
      >
        Execute Next Move
      </button>
      
      <button 
        id="toggle-auto-battle"
        className={`py-2 px-4 ${isAutoBattling ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded transition-colors`}
        onClick={onToggleAutoBattle}
      >
        {isAutoBattling ? 'Stop Auto Battle' : 'Start Auto Battle'}
      </button>
      
      <button 
        id="restart-battle"
        className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        onClick={onRestartBattle}
      >
        Restart Battle
      </button>
    </div>
  );
}