import typeEffectiveness from './data/types';

export class BattleMechanics {
  typeEffectiveness: any;
  
  constructor() {
    this.typeEffectiveness = typeEffectiveness;
  }
  
  calculateDamage(attacker: any, defender: any, move: any) {
    // Basic damage formula
    const level = 50; // Default level
    
    // Determine which attack stat to use (physical or special)
    // This is a simplification - in real Pokémon, moves are physical or special
    // For simplicity, we could assume certain types are special and others physical
    const isSpecial = ['water', 'fire', 'grass', 'electric', 'ice', 'psychic', 'dragon', 'dark', 'ghost', 'fairy'].includes(move.type);
    
    const attackStat = isSpecial ? attacker.specialAttack : attacker.attack;
    const defenseStat = isSpecial ? defender.specialDefense : defender.defense;
    
    // Calculate type effectiveness for dual types
    let effectiveness = this.calculateTypeEffectiveness(move.type, defender.type);
    
    // Calculate damage
    const baseDamage = ((2 * level / 5 + 2) * move.power * (attackStat / defenseStat) / 50) + 2;
    
    // Apply random factor (0.85 to 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;
    
    // Apply STAB (Same Type Attack Bonus)
    let stab = 1;
    const attackerTypes = attacker.type.split('/');
    if (attackerTypes.includes(move.type)) {
      stab = 1.5;
    }
    
    // Calculate final damage
    const finalDamage = Math.floor(baseDamage * stab * effectiveness * randomFactor);
    
    return {
      damage: finalDamage,
      effectiveness: effectiveness
    };
  }
  
  calculateTypeEffectiveness(moveType: string, defenderType: string) {
    // Handle dual types by splitting and multiplying effectiveness
    const defenderTypes = defenderType.split('/');
    let totalEffectiveness = 1;
    
    for (const type of defenderTypes) {
      if (this.typeEffectiveness[moveType] && this.typeEffectiveness[moveType][type] !== undefined) {
        totalEffectiveness *= this.typeEffectiveness[moveType][type];
      }
    }
    
    return totalEffectiveness;
  }
  
  getEffectivenessMessage(effectiveness: number) {
    if (effectiveness === 0) {
      return "It had no effect...";
    } else if (effectiveness < 1) {
      return "It's not very effective...";
    } else if (effectiveness > 1) {
      return "It's super effective!";
    }
    return "";
  }
}

export default BattleMechanics;