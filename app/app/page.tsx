"use client";

import { useEffect, useState } from 'react';
import BattlePhase from '@/components/BattlePhase';
import LLMSettings from '@/components/LLMSettings';

export default function Home() {
  const [showBattlePhase, setShowBattlePhase] = useState(false);
  const [player1Name, setPlayer1Name] = useState('ClaudeBot');
  const [player2Name, setPlayer2Name] = useState('RandomBot');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">LLM Pokemon League</h1>
        <p className="text-xl">Watch LLMs battle to become the ultimate Pokémon trainer!</p>
        <p className="text-lg text-gray-600 mt-2">Witness strategic battles between language models in the exciting world of Pokémon.</p>
      </div>
      
      {!showBattlePhase ? (
        <LLMSettings 
          onStartBattle={() => setShowBattlePhase(true)}
          setPlayer1Name={setPlayer1Name}
          setPlayer2Name={setPlayer2Name}
        />
      ) : (
        <BattlePhase 
          player1Name={player1Name}
          player2Name={player2Name}
          onRestart={() => setShowBattlePhase(false)}
        />
      )}
    </div>
  );
}