"use client";

import { useEffect, useState, useRef } from 'react';
import PokemonDisplay from './PokemonDisplay';
import TeamDisplay from './TeamDisplay';
import BattleControls from './BattleControls';
import BattleLog from './BattleLog';
import SwitchModal from './SwitchModal';
import { GameController } from '@/lib/GameController';
import { LLMBattleController } from '@/lib/LLMBattleController';
import { UIManager } from '@/lib/UIManager';

interface BattlePhaseProps {
  player1Name: string;
  player2Name: string;
  onRestart: () => void;
}

export default function BattlePhase({ player1Name, player2Name, onRestart }: BattlePhaseProps) {
  const [battleStarted, setBattleStarted] = useState(false);
  const [isAutoBattling, setIsAutoBattling] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>(['Battle will begin soon...']);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchOptions, setSwitchOptions] = useState<any[]>([]);
  const [currentSwitchPlayer, setCurrentSwitchPlayer] = useState<string | null>(null);
  const [player1Pokemon, setPlayer1Pokemon] = useState<any>(null);
  const [player2Pokemon, setPlayer2Pokemon] = useState<any>(null);
  const [player1Team, setPlayer1Team] = useState<any[]>([]);
  const [player2Team, setPlayer2Team] = useState<any[]>([]);
  const [player1ActiveIndex, setPlayer1ActiveIndex] = useState(0);
  const [player2ActiveIndex, setPlayer2ActiveIndex] = useState(0);
  
  // References to controllers
  const gameControllerRef = useRef<any>(null);
  const uiManagerRef = useRef<any>(null);
  const llmBattleControllerRef = useRef<any>(null);
  
  // Initialize controllers and start battle
  useEffect(() => {
    // Create custom UIManager that works with React state
    const customUIManager = new UIManager();
    
    // Override methods to work with React
    customUIManager.addBattleLog = (message: string) => {
      setBattleLog(prev => [...prev, message]);
    };
    
    customUIManager.showSwitchOptions = (player: string, team: any[], activeIndex: number) => {
      const options = team
        .filter((pokemon, index) => index !== activeIndex && pokemon.currentHP > 0)
        .map((pokemon, index) => ({
          ...pokemon,
          originalIndex: team.findIndex(p => p.name === pokemon.name)
        }));
      
      setSwitchOptions(options);
      setCurrentSwitchPlayer(player);
      setShowSwitchModal(true);
    };
    
    // Initialize controllers
    const gameController = new GameController(customUIManager);
    const llmBattleController = new LLMBattleController(gameController, customUIManager);
    
    // Store references
    gameControllerRef.current = gameController;
    uiManagerRef.current = customUIManager;
    llmBattleControllerRef.current = llmBattleController;
    
    // Set player names
    customUIManager.setPlayerNames = (p1Name: string, p2Name: string) => {
      // This is handled by props in React
    };
    
    // Set up event listeners for Pokemon updates
    const handlePokemonUpdate = (event: CustomEvent) => {
      const { playerId, pokemon } = event.detail;
      if (playerId === 'player1') {
        setPlayer1Pokemon(pokemon);
      } else if (playerId === 'player2') {
        setPlayer2Pokemon(pokemon);
      }
    };

    // Set up event listeners for team updates
    const handleTeamUpdate = () => {
      if (gameController) {
        setPlayer1Team([...gameController.player1Team]);
        setPlayer2Team([...gameController.player2Team]);
        setPlayer1ActiveIndex(gameController.player1ActiveIndex);
        setPlayer2ActiveIndex(gameController.player2ActiveIndex);
      }
    };
    
    // Add event listeners
    window.addEventListener('pokemonUpdate' as any, handlePokemonUpdate as any);
    
    // Start battle
    llmBattleController.startBattle();
    setBattleStarted(true);

    // Set initial teams
    setTimeout(() => {
      handleTeamUpdate();
    }, 500);

    // Set up interval to update teams
    const teamUpdateInterval = setInterval(handleTeamUpdate, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('pokemonUpdate' as any, handlePokemonUpdate as any);
      clearInterval(teamUpdateInterval);
    };
  }, [player1Name, player2Name]);
  
  const handleSwitchPokemon = (newIndex: number) => {
    if (currentSwitchPlayer && gameControllerRef.current) {
      gameControllerRef.current.switchPlayerPokemon(currentSwitchPlayer, newIndex);
      setShowSwitchModal(false);
    }
  };
  
  const handleNextMove = () => {
    if (llmBattleControllerRef.current) {
      llmBattleControllerRef.current.executeNextMove();
    }
  };
  
  const handleToggleAutoBattle = () => {
    if (llmBattleControllerRef.current) {
      llmBattleControllerRef.current.toggleAutoBattle();
      setIsAutoBattling(!isAutoBattling);
    }
  };
  
  const handleRestartBattle = () => {
    if (llmBattleControllerRef.current) {
      llmBattleControllerRef.current.restartBattle();
      onRestart();
    }
  };
  
  return (
    <div className="battle-container flex flex-col md:flex-row gap-2 max-w-6xl mx-auto">
      <div className="battle-main-content md:w-2/3">
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="compact-display">
            <TeamDisplay
              team={player1Team}
              activeIndex={player1ActiveIndex}
              playerId="player1"
              playerName={player1Name}
            />
            <PokemonDisplay 
              playerId="player1"
              playerName={player1Name}
              gameController={gameControllerRef.current}
              pokemon={player1Pokemon}
            />
          </div>
          
          <div className="compact-display">
            <TeamDisplay
              team={player2Team}
              activeIndex={player2ActiveIndex}
              playerId="player2"
              playerName={player2Name}
            />
            <PokemonDisplay 
              playerId="player2"
              playerName={player2Name}
              gameController={gameControllerRef.current}
              pokemon={player2Pokemon}
            />
          </div>
        </div>
        
        <BattleControls 
          onNextMove={handleNextMove}
          onToggleAutoBattle={handleToggleAutoBattle}
          onRestartBattle={handleRestartBattle}
          isAutoBattling={isAutoBattling}
        />
      </div>
      
      <div className="battle-sidebar md:w-1/3">
        <BattleLog messages={battleLog} />
      </div>
      
      {showSwitchModal && (
        <SwitchModal 
          options={switchOptions}
          onClose={() => setShowSwitchModal(false)}
          onSelect={handleSwitchPokemon}
        />
      )}
    </div>
  );
}