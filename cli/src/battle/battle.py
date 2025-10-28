import json
import random
from .battle_mechanics import BattleMechanics


import os
# Get the path to the data directory relative to the project root
data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'type_effectiveness.json')
with open(data_path, 'r') as f:
    type_effectiveness = json.load(f)

class Battle:
    def __init__(self, trainer1, trainer2):
        self.trainer1 = trainer1
        self.trainer2 = trainer2
        self.battle_mechanics = BattleMechanics()
        self.turn = 0
        self.battle_log = []
        self.winner = None
        
    def log_action(self, message):
        self.battle_log.append(message)
        print(message)
    
    def execute_turn(self, trainer1_action, trainer2_action):
        self.turn += 1
        self.log_action(f"\n--- Turn {self.turn} ---")
        
        # Get active Pokemon
        pokemon1 = self.trainer1.get_active_pokemon()
        pokemon2 = self.trainer2.get_active_pokemon()
        
        if not pokemon1 or not pokemon2:
            return False
        
        # Parse actions
        # Action format: {"type": "attack", "move_index": 0} or {"type": "switch", "pokemon_index": 1}
        actions = [trainer1_action, trainer2_action]
        trainers = [self.trainer1, self.trainer2]
        pokemons = [pokemon1, pokemon2]
        
        # Handle switches first (including forced switches due to fainted Pokémon)
        for i in range(2):
            if actions[i]["type"] == "switch":
                new_index = actions[i]["pokemon_index"]
                if trainers[i].switch_pokemon(new_index):
                    pokemons[i] = trainers[i].get_active_pokemon()
                    self.log_action(f"{trainers[i].name} switched to {pokemons[i].name}!")
        
        # Determine order (higher speed goes first)
        order = [0, 1] if pokemons[0].stats['speed'] >= pokemons[1].stats['speed'] else [1, 0]
        
        # Execute attacks
        for i in order:
            opponent_idx = 1 - i
            
            if pokemons[i].is_fainted() or pokemons[opponent_idx].is_fainted():
                continue
                
            if actions[i]["type"] == "attack":
                move_index = actions[i]["move_index"]
                if 0 <= move_index < len(pokemons[i].moves):
                    move = pokemons[i].moves[move_index]
                    
                    # Check if move hits (based on accuracy)
                    hit = random.random() * 100 <= move.accuracy
                    
                    if hit:
                        self.log_action(f"{pokemons[i].name} used {move.name}!")
                        
                        # Record the move for the opponent
                        trainers[opponent_idx].record_opponent_move(pokemons[i].name, move.name)
                        
                        # Calculate and apply damage
                        result = self.battle_mechanics.calculate_damage(pokemons[i], pokemons[opponent_idx], move)
                        effectiveness_msg = self.battle_mechanics.get_effectiveness_message(result['effectiveness'])
                        if effectiveness_msg:
                            self.log_action(effectiveness_msg)
                            
                        fainted = self.battle_mechanics.apply_damage(pokemons[opponent_idx], result['damage'])
                        self.log_action(f"{pokemons[opponent_idx].name} took {result['damage']} damage! HP: {pokemons[opponent_idx].current_hp}/{pokemons[opponent_idx].stats['hp']}")
                        
                        if fainted:
                            self.log_action(f"{pokemons[opponent_idx].name} fainted!")
                            
                            # Check if the battle is over
                            if not trainers[opponent_idx].has_valid_pokemon():
                                self.log_action(f"{trainers[i].name} wins the battle!")
                                self.winner = trainers[i]
                                trainers[i].record_win()
                                trainers[opponent_idx].record_loss()
                                return False
                            
                            # If the opponent still has valid Pokémon, they need to choose a new one
                            # This will be handled by the LLM in the next turn
                            self.log_action(f"{trainers[opponent_idx].name} needs to choose a new Pokémon!")
                    else:
                        self.log_action(f"{pokemons[i].name} used {move.name}, but it missed!")
        
        return True  # Battle continues
    
    def get_battle_state(self, for_trainer_index):
        """Get the current battle state from a trainer's perspective"""
        trainer = self.trainer1 if for_trainer_index == 0 else self.trainer2
        opponent = self.trainer2 if for_trainer_index == 0 else self.trainer1
        
        active_pokemon = trainer.get_active_pokemon()
        opponent_pokemon = opponent.get_active_pokemon()
        
        # If the trainer's active Pokémon has fainted but they have other valid Pokémon
        if active_pokemon and active_pokemon.is_fainted() and trainer.has_valid_pokemon():
            # Return a special state indicating they need to choose a new Pokémon
            return {
                "needs_switch": True,
                "team_status": trainer.get_team_status(),
                "opponent_pokemon": opponent_pokemon.get_opponent_visible_info() if opponent_pokemon else None,
                "turn": self.turn,
                "last_log_entries": self.battle_log[-min(5, len(self.battle_log)):]
            }
        
        if not active_pokemon or not opponent_pokemon:
            return None
        
        # Get known moves for the opponent's active Pokemon
        known_moves = []
        if opponent_pokemon.name in trainer.known_opponent_moves:
            known_moves = trainer.known_opponent_moves[opponent_pokemon.name]
        
        return {
            "needs_switch": False,
            "active_pokemon": active_pokemon.get_battle_info(),
            "opponent_pokemon": opponent_pokemon.get_opponent_visible_info(),
            "opponent_known_moves": known_moves,
            "team_status": trainer.get_team_status(),
            "turn": self.turn,
            "last_log_entries": self.battle_log[-min(5, len(self.battle_log)):]
        }
