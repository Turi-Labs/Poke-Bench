class BattleMechanics {
    constructor(typeEffectiveness) {
        this.typeEffectiveness = typeEffectiveness;
    }

    calculateDamage(move, attackerType, defenderType) {
        const baseDamage = move.power;
        const stab = move.type === attackerType ? 1.5 : 1; // Same Type Attack Bonus
        const effectiveness = this.getEffectiveness(move.type, defenderType);
        const random = Math.random() * (1.1 - 0.9) + 0.9; // Random factor between 0.9 and 1.1

        return Math.floor(baseDamage * stab * effectiveness * random);
    }

    getEffectiveness(attackType, defenderType) {
        if (!this.typeEffectiveness[attackType]) return 1;
        return this.typeEffectiveness[attackType][defenderType] || 1;
    }

    getEffectivenessText(effectiveness) {
        if (effectiveness > 1) {
            return "It's super effective!";
        } else if (effectiveness < 1 && effectiveness > 0) {
            return "It's not very effective...";
        } else if (effectiveness === 0) {
            return "It has no effect...";
        }
        return "";
    }
}
