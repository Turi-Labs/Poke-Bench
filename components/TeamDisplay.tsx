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
      <div className="team-display animate-pulse">
        <h3 className="text-lg font-semibold mb-2">{playerName}'s Team</h3>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-16 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="team-display bg-gray-100 p-3 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">{playerName}'s Team</h3>
      <div className="grid grid-cols-3 gap-2">
        {team.map((pokemon, index) => {
          const isActive = index === activeIndex;
          const isFainted = pokemon.currentHP <= 0;
          
          return (
            <div 
              key={index}
              className={`pokemon-team-item p-2 rounded-md text-center ${
                isActive ? 'bg-blue-200 border-2 border-blue-500' : 
                isFainted ? 'bg-gray-300 opacity-60' : 'bg-white'
              }`}
            >
              <div className="relative">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  className="w-10 h-10 object-contain mx-auto"
                />
                {isFainted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">FAINTED</span>
                  </div>
                )}
              </div>
              <div className="text-xs font-medium mt-1 truncate">{pokemon.name}</div>
              <div className="text-xs mt-1">
                <span className={`type type-${pokemon.type.toLowerCase()} text-xs py-0 px-1`}>
                  {pokemon.type}
                </span>
              </div>
              <div className={`text-xs mt-1 ${isFainted ? 'text-red-600' : pokemon.currentHP < pokemon.hp / 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                {pokemon.currentHP}/{pokemon.hp}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}