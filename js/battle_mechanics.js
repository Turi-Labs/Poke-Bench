class BattleMechanics {
    constructor() {
        this.typeEffectiveness = typeEffectiveness;
    }
    
    calculateDamage(attacker, defender, move) {
        // Basic damage formula
        const level = 50; // Default level
        const attackStat = attacker.attack;
        const defenseStat = defender.defense;
        
        // Calculate type effectiveness
        let effectiveness = 1;
        if (this.typeEffectiveness[move.type] && this.typeEffectiveness[move.type][defender.type]) {
            effectiveness = this.typeEffectiveness[move.type][defender.type];
        }
        
        // Calculate damage
        const baseDamage = ((2 * level / 5 + 2) * move.power * (attackStat / defenseStat) / 50) + 2;
        
        // Apply random factor (0.85 to 1.0)
        const randomFactor = 0.85 + Math.random() * 0.15;
        
        // Apply STAB (Same Type Attack Bonus)
        const stab = move.type === attacker.type ? 1.5 : 1;
        
        // Calculate final damage
        const finalDamage = Math.floor(baseDamage * stab * effectiveness * randomFactor);
        
        return {
            damage: finalDamage,
            effectiveness: effectiveness
        };
    }
    
    getEffectivenessMessage(effectiveness) {
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