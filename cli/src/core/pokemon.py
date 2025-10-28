class Pokemon:
    def __init__(self, name, types, stats, moves):
        self.name = name
        self.types = types if isinstance(types, list) else [types]
        self.stats = stats  # dict with hp, attack, defense, sp_attack, sp_defense, speed
        self.moves = moves  # list of Move objects
        self.current_hp = stats['hp']
        self.status = None  # For status conditions like poison, etc.
        
    def is_fainted(self):
        return self.current_hp <= 0
        
    def get_basic_info(self):
        """Returns basic info for team selection"""
        return {
            'name': self.name,
            'types': self.types,
            'stats': self.stats
        }
    
    def get_battle_info(self):
        """Returns full info for battle"""
        return {
            'name': self.name,
            'types': self.types,
            'stats': self.stats,
            'current_hp': self.current_hp,
            'moves': [{'name': m.name, 'type': m.type, 'power': m.power, 'accuracy': m.accuracy} for m in self.moves]
        }
    
    def get_opponent_visible_info(self):
        """Returns only info visible to opponent"""
        return {
            'name': self.name,
            'current_hp': self.current_hp,
            'max_hp': self.stats['hp']
        }
    
    def __repr__(self):
        return f"{self.name} ({'/'.join(self.types)}) - HP: {self.current_hp}/{self.stats['hp']}"
