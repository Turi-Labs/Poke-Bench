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
      <div className="bg-white rounded-md shadow-md p-2 relative border-2 border-blue-600 animate-pulse">
        <div className="absolute top-0 left-0 right-0 h-4 bg-red-500 rounded-t-md"></div>
        <h3 className="text-xs font-bold text-white relative z-10 mb-2">{playerName}</h3>
        <div className="bg-gray-200 h-20 w-20 rounded-full mx-auto"></div>
        <div className="mt-2">
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto mb-1"></div>
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
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
    <div className="bg-white rounded-md shadow-md p-2 relative border-2 border-blue-600">
      <div className="absolute top-0 left-0 right-0 h-4  rounded-t-md"></div>
      <h3 className="text-s font-bold text-black relative z-10 mb-2" id={`${playerId}-name`}>{playerName}</h3>
      
      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 border border-blue-500">
        {pokemon.sprite && (
          <img 
            src={pokemon.sprite} 
            alt={pokemon.name} 
            id={`${playerId}-sprite`}
            className="w-16 h-16 object-contain"
          />
        )}
      </div>
      
      <div className="bg-gray-100 rounded-sm border border-gray-300 p-1 mt-1 text-center">
        <h4 className="text-xs font-semibold" id={`${playerId}-pokemon-name`}>{pokemon.name}</h4>
        
        <div id={`${playerId}-type`} className="my-1">
          <span 
            className="inline-block px-1 py-0.5 rounded text-white text-[8px] font-medium"
            style={{ backgroundColor: getTypeColor(pokemon.type.toLowerCase()) }}
          >
            {pokemon.type}
          </span>
        </div>
        
        <div className="mt-1">
          <span id={`${playerId}-hp`} className="text-xs">{pokemon.currentHP}/{pokemon.hp}</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-400 mt-0.5">
            <div 
              className={`h-full ${hpColor} transition-all duration-500`} 
              id={`${playerId}-hp-fill`} 
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-1 mt-1" id={`${playerId}-moves`}>
        {pokemon.moves && pokemon.moves.map((move: any, index: number) => (
          <button 
            key={index}
            className="py-0.5 px-1 rounded text-white text-[8px] font-medium transition-colors border border-gray-700"
            style={{ backgroundColor: getTypeColor(move.type.toLowerCase()) }}
            onClick={() => handleMoveClick(move)}
          >
            {move.name}
          </button>
        ))}
      </div>
      
      <button 
        id={`${playerId}-switch`} 
        className="w-full mt-1 py-0.5 bg-blue-500 text-white rounded text-[8px] border border-blue-700 hover:bg-blue-600"
        onClick={handleSwitchClick}
      >
        Switch
      </button>
      
      <div className="mt-1 p-1 bg-gray-100 rounded border border-gray-300 text-[8px]" id={`${playerId}-thinking`}>
  <h3 className="font-semibold text-[18px]">LLM Reasoning</h3>
  <div 
    className="max-h-[200px] overflow-y-auto" 
    style={{
      scrollbarWidth: 'thin', /* Firefox */
      scrollbarColor: '#CBD5E0 #EDF2F7', /* Firefox */
    }}
  >
    <style jsx>{`
      div::-webkit-scrollbar {
        width: 8px;
      }
      div::-webkit-scrollbar-track {
        background: #EDF2F7;
        border-radius: 4px;
      }
      div::-webkit-scrollbar-thumb {
        background-color: #CBD5E0;
        border-radius: 4px;
      }
    `}</style>
    <p className="text-[18px]">{thinking}</p>
  </div>
</div>
    </div>
  );
}

// Helper function to get type colors
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  
  return typeColors[type] || '#A8A878'; // Default to normal type color
}