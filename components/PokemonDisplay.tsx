"use client";

import { useEffect, useState } from 'react';

interface PokemonDisplayProps {
  playerId: string;
  playerName: string;
  gameController: any;
  pokemon: any;
}

export default function PokemonDisplay({ playerId, playerName, gameController, pokemon }: PokemonDisplayProps) {
  const [thinking, setThinking] = useState<string>('Waiting for battle to start...');
  
  // Subscribe to thinking updates
  useEffect(() => {
    if (!gameController) return;
    
    // Create a custom event for thinking updates
    const thinkingHandler = (event: CustomEvent) => {
      if (event.detail.playerId === playerId) {
        setThinking(event.detail.message);
      }
    };
    
    // Add event listeners
    window.addEventListener('thinkingUpdate' as any, thinkingHandler as any);
    
    return () => {
      window.removeEventListener('thinkingUpdate' as any, thinkingHandler as any);
    };
  }, [gameController, playerId]);
  
  const handleMoveClick = (move: any) => {
    if (gameController) {
      gameController.executeMove(playerId, move);
    }
  };
  
  const handleSwitchClick = () => {
    if (gameController) {
      gameController.showSwitchOptions(playerId);
    }
  };
  
  if (!pokemon) {
    return (
      <div className="pokemon-display animate-pulse p-3 border rounded-lg shadow-sm max-w-xs">
        <h3 className="text-lg font-bold mb-2">{playerName}</h3>
        <div className="pokemon-sprite bg-gray-200 h-24 w-24 rounded-md mx-auto"></div>
        <div className="pokemon-info mt-2">
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-1"></div>
          <div className="hp-container mt-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const hpPercentage = (pokemon.currentHP / pokemon.hp) * 100;
  let hpColor = 'bg-green-500';
  
  if (hpPercentage <= 20) {
    hpColor = 'bg-red-500';
  } else if (hpPercentage <= 50) {
    hpColor = 'bg-yellow-500';
  }
  
  return (
    <div className="pokemon-display p-3 border rounded-lg shadow-sm max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold" id={`${playerId}-name`}>{playerName}</h3>
        <div id={`${playerId}-type`} className="text-xs">
          <span className={`type type-${pokemon.type.toLowerCase()} px-2 py-1 rounded-full text-white bg-opacity-80 bg-${pokemon.type.toLowerCase()}-500`}>
            {pokemon.type}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="pokemon-sprite flex-shrink-0">
          {pokemon.sprite && (
            <img 
              src={pokemon.sprite} 
              alt={pokemon.name} 
              id={`${playerId}-sprite`}
              className="w-20 h-20 object-contain"
            />
          )}
        </div>
        
        <div className="pokemon-info flex-grow">
          <h4 className="text-md font-semibold" id={`${playerId}-pokemon-name`}>{pokemon.name}</h4>
          
          <div className="hp-container mt-1">
            <div className="flex justify-between text-xs mb-1">
              <span id={`${playerId}-hp`}>{pokemon.currentHP}/{pokemon.hp} HP</span>
              <span>{Math.round(hpPercentage)}%</span>
            </div>
            <div className="hp-bar h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`hp-fill ${hpColor} h-full`} 
                id={`${playerId}-hp-fill`} 
                style={{ width: `${hpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="moves-container grid grid-cols-2 gap-1 mt-2" id={`${playerId}-moves`}>
        {pokemon.moves && pokemon.moves.map((move: any, index: number) => (
          <button 
            key={index}
            className={`move-btn type-${move.type.toLowerCase()} text-xs py-1 px-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors`}
            onClick={() => handleMoveClick(move)}
          >
            {move.name}
          </button>
        ))}
      </div>
      
      <div className="flex mt-2">
        <button 
          id={`${playerId}-switch`} 
          className="switch-btn text-xs py-1 px-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors w-full"
          onClick={handleSwitchClick}
        >
          Switch
        </button>
      </div>
      
      <div className="thinking-display mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200" id={`${playerId}-thinking`}>
        <h3 className="font-semibold text-xs text-gray-600">Thinking:</h3>
        <p className="text-gray-700 text-xs line-clamp-2 h-8 overflow-y-auto">{thinking}</p>
      </div>
    </div>
  );
}