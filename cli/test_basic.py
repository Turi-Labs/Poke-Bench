#!/usr/bin/env python3
"""
Basic functionality test for Pokemon League Tournament System
"""

import json
import os
from src.core.pokemon import Pokemon
from src.core.moves import Move
from src.core.trainer import Trainer
from src.battle.battle import Battle
from src.battle.battle_mechanics import BattleMechanics

def test_data_loading():
    """Test if data files can be loaded"""
    print("🔍 Testing data file loading...")
    
    try:
        with open('data/pokemon_data.json', 'r') as f:
            pokemon_data = json.load(f)
        print(f"✅ Loaded {len(pokemon_data)} Pokemon")
        
        with open('data/moves_data.json', 'r') as f:
            moves_data = json.load(f)
        print(f"✅ Loaded {len(moves_data)} moves")
        
        with open('data/type_effectiveness.json', 'r') as f:
            type_effectiveness = json.load(f)
        print(f"✅ Loaded type effectiveness chart")
        
        return pokemon_data, moves_data, type_effectiveness
    except FileNotFoundError as e:
        print(f"❌ Data file not found: {e}")
        return None, None, None
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        return None, None, None

def test_pokemon_creation():
    """Test Pokemon and Move creation"""
    print("\n🐾 Testing Pokemon creation...")
    
    try:
        # Create a test move
        move = Move("Thunderbolt", "Electric", 90, 100)
        print(f"✅ Created move: {move}")
        
        # Create a test Pokemon
        stats = {"hp": 35, "attack": 55, "defense": 40, "sp_attack": 50, "sp_defense": 50, "speed": 90}
        pokemon = Pokemon("Pikachu", ["Electric"], stats, [move])
        print(f"✅ Created Pokemon: {pokemon}")
        
        return True
    except Exception as e:
        print(f"❌ Pokemon creation error: {e}")
        return False

def test_trainer_creation():
    """Test Trainer creation and team management"""
    print("\n👨‍🎓 Testing Trainer creation...")
    
    try:
        trainer = Trainer("Ash")
        print(f"✅ Created trainer: {trainer.name}")
        
        # Create test Pokemon
        move = Move("Tackle", "Normal", 40, 100)
        stats = {"hp": 45, "attack": 49, "defense": 49, "sp_attack": 65, "sp_defense": 65, "speed": 45}
        pokemon = Pokemon("Bulbasaur", ["Grass", "Poison"], stats, [move])
        
        trainer.add_pokemon(pokemon)
        print(f"✅ Added Pokemon to team. Team size: {len(trainer.team)}")
        
        active = trainer.get_active_pokemon()
        print(f"✅ Active Pokemon: {active.name if active else 'None'}")
        
        return True
    except Exception as e:
        print(f"❌ Trainer creation error: {e}")
        return False

def test_battle_mechanics():
    """Test battle mechanics"""
    print("\n⚔️ Testing battle mechanics...")
    
    try:
        mechanics = BattleMechanics()
        print("✅ Created BattleMechanics instance")
        
        # Create test Pokemon and moves
        move1 = Move("Water Gun", "Water", 40, 100)
        move2 = Move("Ember", "Fire", 40, 100)
        
        stats1 = {"hp": 44, "attack": 48, "defense": 65, "sp_attack": 50, "sp_defense": 64, "speed": 43}
        stats2 = {"hp": 39, "attack": 52, "defense": 43, "sp_attack": 60, "sp_defense": 50, "speed": 65}
        
        pokemon1 = Pokemon("Squirtle", ["Water"], stats1, [move1])
        pokemon2 = Pokemon("Charmander", ["Fire"], stats2, [move2])
        
        # Test damage calculation
        result = mechanics.calculate_damage(pokemon1, pokemon2, move1)
        print(f"✅ Damage calculation: {result['damage']} damage, {result['effectiveness']}x effectiveness")
        
        return True
    except Exception as e:
        print(f"❌ Battle mechanics error: {e}")
        return False

def test_output_directories():
    """Test if output directories exist"""
    print("\n📁 Testing output directories...")
    
    directories = ['output', 'data', 'src', 'docs']
    all_exist = True
    
    for directory in directories:
        if os.path.exists(directory):
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Directory missing: {directory}")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🏆 Pokemon League Tournament System - Basic Tests")
    print("=" * 60)
    
    # Test data loading
    pokemon_data, moves_data, type_effectiveness = test_data_loading()
    if not pokemon_data:
        print("\n❌ Cannot continue without data files")
        return False
    
    # Test Pokemon creation
    if not test_pokemon_creation():
        return False
    
    # Test Trainer creation
    if not test_trainer_creation():
        return False
    
    # Test battle mechanics
    if not test_battle_mechanics():
        return False
    
    # Test directories
    if not test_output_directories():
        return False
    
    print("\n" + "=" * 60)
    print("✅ All basic tests passed! The system appears to be working correctly.")
    print("\n🚀 Ready to run the full tournament with: python main.py")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
