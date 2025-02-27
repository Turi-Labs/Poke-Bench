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
      <div className="pokemon-display animate-pulse">
        <h3 className="text-xl font-bold mb-4">{playerName}</h3>
        <div className="pokemon-sprite bg-gray-200 h-32 rounded-md"></div>
        <div className="pokemon-info mt-4">
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
          <div className="hp-container mt-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
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
    <div className="pokemon-display">
      <h3 className="text-xl font-bold mb-4" id={`${playerId}-name`}>{playerName}</h3>
      
      <div className="pokemon-sprite">
        {pokemon.sprite && (
          <img 
            src={pokemon.sprite} 
            alt={pokemon.name} 
            id={`${playerId}-sprite`}
            className="w-32 h-32 object-contain"
          />
        )}
      </div>
      
      <div className="pokemon-info">
        <h4 className="text-lg font-semibold" id={`${playerId}-pokemon-name`}>{pokemon.name}</h4>
        
        <div id={`${playerId}-type`} className="my-2">
          <span className={`type type-${pokemon.type.toLowerCase()}`}>{pokemon.type}</span>
        </div>
        
        <div className="hp-container">
          <span id={`${playerId}-hp`}>{pokemon.currentHP}/{pokemon.hp}</span>
          <div className="hp-bar">
            <div 
              className={`hp-fill ${hpColor}`} 
              id={`${playerId}-hp-fill`} 
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="moves-container" id={`${playerId}-moves`}>
        {pokemon.moves && pokemon.moves.map((move: any, index: number) => (
          <button 
            key={index}
            className={`move-btn type-${move.type.toLowerCase()}`}
            onClick={() => handleMoveClick(move)}
          >
            {move.name}
          </button>
        ))}
      </div>
      
      <button 
        id={`${playerId}-switch`} 
        className="switch-btn"
        onClick={handleSwitchClick}
      >
        Switch Pokemon
      </button>
      
      <div className="thinking-display" id={`${playerId}-thinking`}>
        <h3 className="font-semibold">Thinking</h3>
        <p>{thinking}</p>
      </div>
    </div>
  );
}