from .pokemon import Pokemon
from .moves import Move
from ..battle.battle_mechanics import BattleMechanics

class Trainer:
    def __init__(self, name):
        self.name = name
        self.team = []  # List of Pokemon objects
        self.known_opponent_moves = {}  # Dictionary of opponent Pokemon name -> list of known moves
        self.active_pokemon_index = 0
        self.wins = 0
        self.losses = 0
    
    def add_pokemon(self, pokemon):
        if len(self.team) < 6:
            self.team.append(pokemon)
            return True
        return False
    
    def get_active_pokemon(self):
        if self.active_pokemon_index < len(self.team):
            return self.team[self.active_pokemon_index]
        return None
    
    def switch_pokemon(self, index):
        if 0 <= index < len(self.team) and not self.team[index].is_fainted():
            self.active_pokemon_index = index
            return True
        return False
    
    def record_opponent_move(self, pokemon_name, move):
        if pokemon_name not in self.known_opponent_moves:
            self.known_opponent_moves[pokemon_name] = []
        
        if move not in self.known_opponent_moves[pokemon_name]:
            self.known_opponent_moves[pokemon_name].append(move)
    
    def has_valid_pokemon(self):
        return any(not pokemon.is_fainted() for pokemon in self.team)
    
    def get_team_status(self):
        return [
            {
                'index': i,
                'name': pokemon.name,
                'current_hp': pokemon.current_hp,
                'max_hp': pokemon.stats['hp'],
                'status': pokemon.status,
                'fainted': pokemon.is_fainted()
            }
            for i, pokemon in enumerate(self.team)
        ]
    
    def reset_team(self):
        """Reset all Pokemon to full health for a new battle"""
        for pokemon in self.team:
            pokemon.current_hp = pokemon.stats['hp']
            pokemon.status = None
        self.active_pokemon_index = 0
        self.known_opponent_moves = {}
    
    def record_win(self):
        self.wins += 1
    
    def record_loss(self):
        self.losses += 1
    
    def get_record(self):
        return f"{self.wins}-{self.losses}"
