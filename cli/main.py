import json
import random
from copy import deepcopy
import time
from src.ai.llm import LLMInterface
from src.core.trainer import Trainer
from src.battle.battle import Battle
from src.core.pokemon import Pokemon
from src.core.moves import Move

# Load data files
with open('data/pokemon_data.json', 'r') as f:
    pokemon_data = json.load(f)

with open('data/moves_data.json', 'r') as f:
    moves_data = json.load(f)

with open('data/type_effectiveness.json', 'r') as f:
    type_effectiveness = json.load(f)

class PokemonLeague:
    def __init__(self, available_pokemon):
        self.available_pokemon = available_pokemon
        self.trainers = []
        self.llm_interface = LLMInterface(available_pokemon)
        self.tournament_results = []
        
    def add_trainer(self, name):
        """Add a new trainer to the league"""
        trainer = Trainer(name)
        self.trainers.append(trainer)
        return trainer
    
    def select_team_for_trainer(self, trainer, pokemon_indices):
        """Select a team for a trainer based on indices"""
        for index in pokemon_indices:
            index = int(index)
            if 0 <= index < len(self.available_pokemon):
                poke_dict = deepcopy(self.available_pokemon[index])
                # Convert move names to Move objects using moves_data
                moves = []
                for move_name in poke_dict['moves']:
                    move_info = moves_data.get(move_name)
                    if move_info:
                        move = Move(move_name, move_info['type'], move_info['power'], move_info['accuracy'])
                        moves.append(move)
                pokemon = Pokemon(
                    poke_dict['name'],
                    poke_dict['types'],
                    poke_dict['stats'],
                    moves
                )
                trainer.add_pokemon(pokemon)
        return len(trainer.team) == 6  # Check if team is complete
    
    def simulate_llm_team_selection(self, trainer_name):
        """Simulate an LLM selecting a team (for testing)"""
        # In a real implementation, this would call the LLM API
        # TODO: Implement this
        # Send the prompt to the LLM and get the response
        indices = self.llm_interface.llm_call(trainer_name, self.llm_interface.get_team_selection_prompt())
        # return trainer
        
        # Something like this
        # indices = random.sample(range(len(self.available_pokemon)), 6)
        
        trainer = self.add_trainer(trainer_name)
        self.select_team_for_trainer(trainer, indices)
        
        return trainer
    
    def simulate_llm_battle_action(self, battle_state, trainer, battle=None):
        """Simulate an LLM choosing a battle action (for testing)"""
        # Check if the trainer needs to switch due to a fainted Pokémon
        if battle_state.get("needs_switch", False):
            # print("fainted", trainer.name)
            # Execute the switch first
            switch_action = self.simulate_llm_switch_decision(trainer, battle)
            if switch_action and switch_action["type"] == "switch":
                trainer.switch_pokemon(switch_action["pokemon_index"])
                print(f"{trainer.name} switched to {trainer.get_active_pokemon().name}!")
            
            # Get the new battle state after switching
            if battle:
                battle_state = battle.get_battle_state(0 if trainer == battle.trainer1 else 1)
        
        # Send the prompt to the LLM and get the response
        # print("new pokemon move", trainer.name)
        action = self.llm_interface.llm_call(trainer.name, self.llm_interface.get_battle_action_prompt(battle_state))
        return action
    
    def simulate_llm_switch_decision(self, trainer, battle):
        """Simulate an LLM deciding whether to switch Pokémon"""
        # In a real implementation, this would call the LLM API
        # TODO: Implement this
        # Send the prompt to the LLM and get the response
        
        action = self.llm_interface.llm_call(trainer.name, self.llm_interface.get_switch_decision_prompt(battle, trainer))
        return action
    
    def run_battle(self, trainer1, trainer2, max_turns=50):
        """Run a battle between two trainers"""
        # Reset both trainers' teams
        trainer1.reset_team()
        trainer2.reset_team()
        
        battle = Battle(trainer1, trainer2)
        
        for turn in range(max_turns):
            # Get battle states
            battle_state1 = battle.get_battle_state(0)
            battle_state2 = battle.get_battle_state(1)
            
            # If either trainer doesn't have a valid battle state, the battle is over
            if not battle_state1 or not battle_state2:
                break
            
            # Check if either trainer needs to switch due to fainted Pokémon
            trainer1_needs_switch = battle_state1.get("needs_switch", False)
            trainer2_needs_switch = battle_state2.get("needs_switch", False)
            
            if trainer1_needs_switch or trainer2_needs_switch:
                # Handle switching first, then get actions
                if trainer1_needs_switch:
                    print(f"{trainer1.name}'s Pokémon fainted! Choosing new Pokémon...")
                    action1 = self.simulate_llm_battle_action(battle_state1, trainer1, battle)
                else:
                    action1 = self.simulate_llm_battle_action(battle_state1, trainer1, battle)
                
                if trainer2_needs_switch:
                    print(f"{trainer2.name}'s Pokémon fainted! Choosing new Pokémon...")
                    action2 = self.simulate_llm_battle_action(battle_state2, trainer2, battle)
                else:
                    action2 = self.simulate_llm_battle_action(battle_state2, trainer2, battle)
            else:
                # Normal turn - both trainers choose actions simultaneously
                action1 = self.simulate_llm_battle_action(battle_state1, trainer1, battle)
                action2 = self.simulate_llm_battle_action(battle_state2, trainer2, battle)
            
            # Execute turn
            battle_continues = battle.execute_turn(action1, action2)
            
            if not battle_continues:
                break
        
        # Record the result
        result = {
            "trainer1": trainer1.name,
            "trainer2": trainer2.name,
            "winner": battle.winner.name if battle.winner else "Draw",
            "turns": battle.turn
        }
        
        self.tournament_results.append(result)
        
        if result['winner'] == "Draw":
            # Handle draw case appropriately, e.g., skip advancing anyone
            winner = None
        else:
            winner = next(t for t in self.trainers if t.name == result['winner'])
        
        return result
    
    def run_tournament(self):
        """Run a 16-person tournament with Ro16, Quarter-finals, Semi-finals and Finals"""
        if len(self.trainers) != 16:
            raise ValueError("Tournament requires exactly 16 trainers")

        # Shuffle trainers for random matchups
        remaining_trainers = self.trainers.copy()
        random.shuffle(remaining_trainers)
        
        # Round of 16
        print("\n=== Round of 16 ===")
        quarterfinalists = []
        for i in range(0, 16, 2):
            trainer1 = remaining_trainers[i]
            trainer2 = remaining_trainers[i + 1]
            print(f"\n{trainer1.name} vs {trainer2.name}")
            result = self.run_battle(trainer1, trainer2)
            if result['winner']:
                if result['winner'] != "Draw":
                    winner = next(t for t in self.trainers if t.name == result['winner'])
                    quarterfinalists.append(winner)
            
        # Quarter-finals
        print("\n=== Quarter-finals ===")
        semifinalists = []
        for i in range(0, 8, 2):
            trainer1 = quarterfinalists[i]
            trainer2 = quarterfinalists[i + 1]
            print(f"\n{trainer1.name} vs {trainer2.name}")
            result = self.run_battle(trainer1, trainer2)
            if result['winner']:
                if result['winner'] != "Draw":
                    winner = next(t for t in self.trainers if t.name == result['winner'])
                    semifinalists.append(winner)
            
        # Semi-finals
        print("\n=== Semi-finals ===")
        finalists = []
        for i in range(0, 4, 2):
            trainer1 = semifinalists[i]
            trainer2 = semifinalists[i + 1]
            print(f"\n{trainer1.name} vs {trainer2.name}")
            result = self.run_battle(trainer1, trainer2)
            if result['winner']:
                if result['winner'] != "Draw":
                    winner = next(t for t in self.trainers if t.name == result['winner'])
                    finalists.append(winner)
            
        # Finals
        print("\n=== Finals ===")
        trainer1 = finalists[0]
        trainer2 = finalists[1]
        print(f"\n{trainer1.name} vs {trainer2.name}")
        result = self.run_battle(trainer1, trainer2)
        if result['winner']:
            if result['winner'] != "Draw":
                winner = next(t for t in self.trainers if t.name == result['winner'])
        
        print("\n=== Tournament Results ===")
        print(f"Champion: {winner.name} with a record of {winner.get_record()}")
        
        return winner

def main():
    """Main function to test the Pokemon League system"""
    # Open single file for all output
    with open('output/tournament_results.txt', 'w') as f:
        
        print("=== Pokemon League Tournament System ===\n")
        f.write("=== Pokemon League Tournament System ===\n\n")
        
        # Initialize the league with available Pokemon
        print("Initializing Pokemon League...")
        f.write("Initializing Pokemon League...\n")
        
        # This assumes 'pokemon_data' is loaded and 'PokemonLeague' is defined
        league = PokemonLeague(pokemon_data)
        print(f"League created with {len(pokemon_data)} available Pokemon\n")
        f.write(f"League created with {len(pokemon_data)} available Pokemon\n\n")
        
        # Create trainers and simulate team selection
        trainer_names = [
            "gpt-4.1", "o4-mini", "o3",
            "claude-3-5-sonnet-20240620", "claude-3-7-sonnet-20250219", "claude-sonnet-4-20250514", 
            "gemini-2.5-pro", "gemini-2.5-flash"
        ]
        
        print("Creating trainers and selecting teams...")
        f.write("Creating trainers and selecting teams...\n")
        f.write("\n=== Team Selection Reasoning ===\n")
            
        for name in trainer_names:
            trainer = league.simulate_llm_team_selection(name)
            team_list = [pokemon.name for pokemon in trainer.team]
            print(f"{name}'s team: {team_list}")
            f.write(f"\n{name}'s team: {team_list}\n")
            f.write(f"Team selected for {name}.\n")
        
        print(f"\nTotal trainers: {len(league.trainers)}\n")
        f.write(f"\nTotal trainers: {len(league.trainers)}\n\n")
        
        # Run Single Elimination Tournament
        print("\n" + "="*50)
        print("SINGLE ELIMINATION TOURNAMENT")
        print("="*50 + "\n")
        f.write("\n" + "="*50 + "\n")
        f.write("SINGLE ELIMINATION TOURNAMENT\n")
        f.write("="*50 + "\n")
        
        # Randomly shuffle trainers for quarterfinals
        remaining_trainers = league.trainers.copy()
        random.shuffle(remaining_trainers)
        
        # Quarter-finals
        print("\n=== Quarter-finals ===")
        f.write("\n=== Quarter-finals ===\n")
        semifinalists = []
        for i in range(0, 8, 2):
            trainer1 = remaining_trainers[i]
            trainer2 = remaining_trainers[i + 1]
            
            f.write(f"\nQuarter-final Match {i//2 + 1}:\n")
            f.write(f"{trainer1.name} vs {trainer2.name}\n")
            
            print(f"\n{trainer1.name} vs {trainer2.name}")
            f.write(f"Battle details and reasoning will be recorded here...\n")
            result = league.run_battle(trainer1, trainer2)
            
            if result.get('winner') and result['winner'] != "Draw":
                winner = next(t for t in league.trainers if t.name == result['winner'])
                print(f"Winner: {winner.name}")
                f.write(f"Winner: {winner.name}\n")
                f.write(f"Battle completed in {result.get('turns', 'unknown')} turns\n")
                semifinalists.append(winner)
            
        # Semi-finals
        print("\n=== Semi-finals ===")
        f.write("\n=== Semi-finals ===\n")
        finalists = []
        for i in range(0, 4, 2):
            trainer1 = semifinalists[i]
            trainer2 = semifinalists[i + 1]
            
            f.write(f"\nSemi-final Match {i//2 + 1}:\n")
            f.write(f"{trainer1.name} vs {trainer2.name}\n")
            
            print(f"\n{trainer1.name} vs {trainer2.name}")
            f.write(f"Battle details and reasoning will be recorded here...\n")
            result = league.run_battle(trainer1, trainer2)
            
            if result.get('winner') and result['winner'] != "Draw":
                winner = next(t for t in league.trainers if t.name == result['winner'])
                print(f"Winner: {winner.name}")
                f.write(f"Winner: {winner.name}\n")
                f.write(f"Battle completed in {result.get('turns', 'unknown')} turns\n")
                finalists.append(winner)
        
        # Finals
        print("\n=== Finals ===")
        f.write("\n=== Finals ===\n")
        trainer1 = finalists[0]
        trainer2 = finalists[1]
        
        f.write(f"\nFinal Match:\n")
        f.write(f"{trainer1.name} vs {trainer2.name}\n")
        
        print(f"\n{trainer1.name} vs {trainer2.name}")
        f.write(f"Championship battle details and reasoning will be recorded here...\n")
        result = league.run_battle(trainer1, trainer2)
        
        if result.get('winner') and result['winner'] != "Draw":
            winner = next(t for t in league.trainers if t.name == result['winner'])
            print(f"Tournament Champion: {winner.name}!")
            f.write(f"Tournament Champion: {winner.name}!\n")
            f.write(f"Championship battle completed in {result.get('turns', 'unknown')} turns\n")
        
        # Display final statistics
        print("\n" + "="*50)
        print("FINAL STATISTICS")
        print("="*50)
        f.write("\n" + "="*50 + "\n")
        f.write("FINAL STATISTICS\n")
        f.write("="*50 + "\n")
        
        print(f"Total battles conducted: {len(league.tournament_results)}")
        f.write(f"Total battles conducted: {len(league.tournament_results)}\n")
        
        # Show battle results summary
        if league.tournament_results:
            print("\nBattle Results Summary:")
            f.write("\nBattle Results Summary:\n")
            for i, res in enumerate(league.tournament_results[-10:], 1):  # Show last 10 battles
                battle_summary = f"{i}. {res['trainer1']} vs {res['trainer2']} -> Winner: {res['winner']} (Turn {res['turns']})"
                print(battle_summary)
                f.write(battle_summary + "\n")
        
        # Show trainer final records
        print("\nFinal Trainer Records:")
        f.write("\nFinal Trainer Records:\n")
        sorted_trainers = sorted(league.trainers, key=lambda t: (t.wins, -t.losses), reverse=True)
        for i, trainer in enumerate(sorted_trainers, 1):
            record_line = f"{i}. {trainer.name}: {trainer.get_record()}"
            team_line = f"   Team: {[pokemon.name for pokemon in trainer.team[:3]]}..."
            print(record_line)
            print(team_line)
            f.write(record_line + "\n")
            f.write(team_line + "\n")
        
        print("\n=== Tournament Complete! ===")
        f.write("\n=== Tournament Complete! ===")

def test_basic_functionality():
    """Test basic functionality without full tournament"""
    print("=== Basic Functionality Test ===\n")
    
    # Test with fewer trainers for quicker testing
    league = PokemonLeague(pokemon_data[:20])  # Use only first 20 Pokemon
    
    # Create 2 trainers
    trainer1 = league.simulate_llm_team_selection("claude-sonnet-4-20250514")
    trainer2 = league.simulate_llm_team_selection("gemini-2.5-pro")
    
    print(f"Trainer 1 team size: {len(trainer1.team)}")
    print(f"Trainer 2 team size: {len(trainer2.team)}")
    
    # Run a single battle
    result = league.run_battle(trainer1, trainer2)
    print(f"Battle result: {result}")
    
    print("Basic functionality test complete!\n")

if __name__ == "__main__":
    # You can choose which test to run
    run_full_test = False  # Set to False for quick basic test
    
    if run_full_test:
        main()
    else:
        test_basic_functionality()