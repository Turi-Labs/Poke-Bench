"use client";

interface TeamDisplayProps {
  team: any[];
  activeIndex: number;
  playerId: string;
  playerName: string;
}

export default function TeamDisplay({ team, activeIndex, playerId, playerName }: TeamDisplayProps) {
  if (!team || team.length === 0) {
    return (
      <div className="bg-gray-100 p-1.5 rounded-md border border-gray-300 animate-pulse">
        <h3 className="text-xs font-semibold mb-1 text-center">{playerName}'s Team</h3>
        <div className="grid grid-cols-6 gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-8 rounded-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-1.5 rounded-md border-2 border-blue-500">
      <h3 className="text-xs font-semibold mb-1 text-center">{playerName}'s Team</h3>
      <div className="grid grid-cols-6 gap-1">
        {team.map((pokemon, index) => {
          const isActive = index === activeIndex;
          const isFainted = pokemon.currentHP <= 0;
          
          return (
            <div 
              key={index}
              className={`rounded-sm text-center ${
                isActive ? 'bg-blue-200 border border-blue-500' : 
                isFainted ? 'bg-gray-300 opacity-60' : 'bg-white border border-gray-300'
              } p-0.5`}
            >
              <div className="relative">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  className="w-10 h-10 object-contain mx-auto"
                />
                {isFainted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-[6px]">X</span>
                  </div>
                )}
              </div>
              <div className="text-[10px] font-medium truncate">{pokemon.name}</div>
              <div className="text-[6px]">
                <span className="inline-block bg-gray-200 text-[10px] py-0 px-0.5 rounded-sm" style={{
                  backgroundColor: getTypeColor(pokemon.type.toLowerCase())
                }}>
                  {pokemon.type.substring(0, 3)}
                </span>
              </div>
              <div className={`text-[10px] ${isFainted ? 'text-red-600' : pokemon.currentHP < pokemon.hp / 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                {pokemon.currentHP}/{pokemon.hp}
              </div>
            </div>
          );
        })}
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