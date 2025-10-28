"use client";

import { useState } from 'react';

interface LLMSettingsProps {
  onStartBattle: () => void;
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string) => void;
}

export default function LLMSettings({ onStartBattle, setPlayer1Name, setPlayer2Name }: LLMSettingsProps) {
  const [llm1Model, setLlm1Model] = useState('random');
  const [llm1Name, setLlm1Name] = useState('ClaudeBot');
  const [llm2Model, setLlm2Model] = useState('random');
  const [llm2Name, setLlm2Name] = useState('RandomBot');
  const [moveDelay, setMoveDelay] = useState(2000);

  const handleStartBattle = () => {
    setPlayer1Name(llm1Name);
    setPlayer2Name(llm2Name);
    
    // Store settings in localStorage for use in battle components
    localStorage.setItem('battleSettings', JSON.stringify({
      llm1: {
        model: llm1Model,
        name: llm1Name
      },
      llm2: {
        model: llm2Model,
        name: llm2Name
      },
      moveDelay
    }));
    
    onStartBattle();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto" id="llm-settings">
      <h2 className="text-2xl font-bold mb-4">Battle Configuration</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Player 1 (LLM 1)</h3>
          <div>
            <label htmlFor="llm1-model" className="block text-sm font-medium text-gray-700 mb-1">
              AI Model:
            </label>
            <select 
              id="llm1-model"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={llm1Model}
              onChange={(e) => setLlm1Model(e.target.value)}
            >
              <option value="random">Random</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
            </select>
          </div>
          <div>
            <label htmlFor="llm1-name" className="block text-sm font-medium text-gray-700 mb-1">
              Bot Name:
            </label>
            <input 
              type="text" 
              id="llm1-name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={llm1Name}
              onChange={(e) => setLlm1Name(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Player 2 (LLM 2)</h3>
          <div>
            <label htmlFor="llm2-model" className="block text-sm font-medium text-gray-700 mb-1">
              AI Model:
            </label>
            <select 
              id="llm2-model"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={llm2Model}
              onChange={(e) => setLlm2Model(e.target.value)}
            >
              <option value="random">Random</option>
              <option value="openai">OpenAI</option>
              <option value="claude">claude</option>
            </select>
          </div>
          <div>
            <label htmlFor="llm2-name" className="block text-sm font-medium text-gray-700 mb-1">
              Bot Name:
            </label>
            <input 
              type="text" 
              id="llm2-name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={llm2Name}
              onChange={(e) => setLlm2Name(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Battle Settings</h3>
        <div>
          <label htmlFor="move-delay" className="block text-sm font-medium text-gray-700 mb-1">
            Delay Between Moves (ms):
          </label>
          <input 
            type="number" 
            id="move-delay"
            className="w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={moveDelay}
            onChange={(e) => setMoveDelay(parseInt(e.target.value))}
            min="500"
            max="5000"
            step="500"
          />
        </div>
      </div>
      
      <div className="text-center">
        <button 
          className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
          onClick={handleStartBattle}
        >
          Start Battle
        </button>
      </div>
    </div>
  );
}