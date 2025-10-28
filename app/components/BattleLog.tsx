"use client";

import { useEffect, useRef } from 'react';

interface BattleLogProps {
  messages: string[];
}

export default function BattleLog({ messages }: BattleLogProps) {
  const logRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className="battle-log-container h-full">
      <h3 className="text-lg font-semibold mb-0 bg-blue-600 text-white p-2 rounded-t-lg">Battle Log</h3>
      <div 
        className="battle-log bg-gray-100 rounded-b-lg p-3 h-[calc(100vh-200px)] overflow-y-auto flex flex-col"
        id="battle-log"
        ref={logRef}
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className="battle-log-message bg-white p-2 rounded-md shadow-sm mb-2 animate-fadeIn"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}