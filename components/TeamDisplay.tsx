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
      <div className="team-display animate-pulse p-2 rounded-md border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold mb-1">{playerName}'s Team</h3>
        <div className="flex flex-wrap gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-12 w-12 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="team-display bg-gray-50 p-2 rounded-md border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold mb-1">{playerName}'s Team</h3>
      <div className="flex flex-wrap gap-1">
        {team.map((pokemon, index) => {
          const isActive = index === activeIndex;
          const isFainted = pokemon.currentHP <= 0;
          
          return (
            <div 
              key={index}
              className={`pokemon-team-item relative rounded-md text-center ${
                isActive ? 'ring-2 ring-blue-500' : 
                isFainted ? 'opacity-60' : ''
              } ${isFainted ? 'bg-gray-100' : 'bg-white'} w-14 h-16 flex flex-col items-center justify-center p-1`}
            >
              <div className="relative inline-block">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  className="w-8 h-8 object-contain"
                />
                {isFainted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-[8px]">KO</span>
                  </div>
                )}
              </div>
              <div className="text-[9px] font-medium truncate w-full">{pokemon.name}</div>
              <div className="flex items-center justify-between w-full mt-0.5">
                <span className={`type type-${pokemon.type.toLowerCase()} text-[8px] py-0 px-0.5 rounded-sm bg-opacity-80 bg-${pokemon.type.toLowerCase()}-500 text-white`}>
                  {pokemon.type.substring(0, 3)}
                </span>
                <span className={`text-[8px] ${isFainted ? 'text-red-600' : pokemon.currentHP < pokemon.hp / 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {pokemon.currentHP}/{pokemon.hp}
                </span>
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}