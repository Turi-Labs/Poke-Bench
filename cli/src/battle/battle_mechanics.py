import json
import random
import os

# Get the path to the data directory relative to the project root
data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'type_effectiveness.json')
with open(data_path, 'r') as f:
    type_effectiveness = json.load(f)

class BattleMechanics:
    def __init__(self):
        self.type_effectiveness = type_effectiveness
    
    def calculate_damage(self, attacker, defender, move):
        # Basic damage formula
        level = 50  # Default level
        
        # Determine which attack and defense stats to use (physical or special)
        # This is simplified - in real Pokémon, move categories determine this
        if move.type in ["Fire", "Water", "Electric", "Grass", "Ice", "Psychic", "Dragon", "Dark", "Ghost"]:
            attack_stat = attacker.stats['sp_attack']
            defense_stat = defender.stats['sp_defense']
        else:
            attack_stat = attacker.stats['attack']
            defense_stat = defender.stats['defense']
        
        # Calculate type effectiveness
        effectiveness = 1
        for defender_type in defender.types:
            if move.type in self.type_effectiveness and defender_type in self.type_effectiveness[move.type]:
                effectiveness *= self.type_effectiveness[move.type][defender_type]
        
        # Calculate damage
        base_damage = ((2 * level / 5 + 2) * move.power * (attack_stat / defense_stat) / 50) + 2
        
        # Apply random factor (0.85 to 1.0)
        random_factor = 0.85 + random.random() * 0.15
        
        # Apply STAB (Same Type Attack Bonus)
        stab = 1.5 if move.type in attacker.types else 1
        
        # Calculate final damage
        final_damage = int(base_damage * stab * effectiveness * random_factor)
        
        return {
            'damage': final_damage,
            'effectiveness': effectiveness
        }
    
    def get_effectiveness_message(self, effectiveness):
        if effectiveness == 0:
            return "It had no effect..."
        elif effectiveness < 1:
            return "It's not very effective..."
        elif effectiveness > 1:
            return "It's super effective!"
        return ""
    
    def apply_damage(self, defender, damage):
        defender.current_hp = max(0, defender.current_hp - damage)
        return defender.is_fainted()
