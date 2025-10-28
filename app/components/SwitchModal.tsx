"use client";

import { useEffect } from 'react';

interface SwitchModalProps {
  options: any[];
  onClose: () => void;
  onSelect: (index: number) => void;
}

export default function SwitchModal({ options, onClose, onSelect }: SwitchModalProps) {
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
        onClose();
      }
    };
    
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Switch Pokemon</h3>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          {options.map((pokemon, index) => (
            <div 
              key={index}
              className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center"
              onClick={() => onSelect(pokemon.originalIndex)}
            >
              <img 
                src={pokemon.sprite} 
                alt={pokemon.name}
                className="w-16 h-16 object-contain mx-auto"
              />
              <h4 className="font-semibold mt-2">{pokemon.name}</h4>
              <div className="mt-1">
                <span className={`type type-${pokemon.type.toLowerCase()}`}>{pokemon.type}</span>
              </div>
              <div className="mt-1">{pokemon.currentHP}/{pokemon.hp} HP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}