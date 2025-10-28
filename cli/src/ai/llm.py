import json
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()


class LLMInterface:
    def __init__(self, available_pokemon):
        self.available_pokemon = available_pokemon
    
    def get_team_selection_prompt(self):
        """Generate a prompt for the LLM to select a team"""
        pokemon_info = []
        
        for i, pokemon in enumerate(self.available_pokemon):
            info = {
                "index": i,
                "name": pokemon["name"],
                "types": pokemon["types"],
                "stats": pokemon["stats"]
            }
            pokemon_info.append(info)
        
        prompt = f"""
        You are a Pokémon trainer. Select 6 Pokémon for your team from the following list.
        Choose strategically to create a balanced team with good type coverage.

        Available Pokémon:
        """
        
        for pokemon in pokemon_info:
            prompt += f"\n{pokemon['index']}. {pokemon['name']} - Types: {', '.join(pokemon['types'])}"
            prompt += f"\n   Stats: HP {pokemon['stats']['hp']}, Atk {pokemon['stats']['attack']}, Def {pokemon['stats']['defense']}, "
            prompt += f"Sp.Atk {pokemon['stats']['sp_attack']}, Sp.Def {pokemon['stats']['sp_defense']}, Speed {pokemon['stats']['speed']}\n"
        
        prompt += """\nRespond with the indices of the 6 Pokémon you want on your team in json format. (e.g., 
        {"Reasoning": "Your reasoning for your team selection", "team": [0, 5, 9, 12, 3, 7] } )."""
        
        return prompt
    
    def get_battle_action_prompt(self, battle_state):
        """Generate a prompt for the LLM to choose a battle action"""
        active_pokemon = battle_state["active_pokemon"]
        opponent_pokemon = battle_state["opponent_pokemon"]
        team_status = battle_state["team_status"]
        
        prompt = f"""
            You are a Pokémon trainer in a battle.

            Current battle state:
            - Turn: {battle_state['turn']}
            - Your active Pokémon: {active_pokemon['name']} (HP: {active_pokemon['current_hp']}/{active_pokemon['stats']['hp']})
            Types: {', '.join(active_pokemon['types'])}
            - Opponent's Pokémon: {opponent_pokemon['name']} (HP: {opponent_pokemon['current_hp']}/{opponent_pokemon['max_hp']})

            Recent battle log:
            """
        
        for log_entry in battle_state["last_log_entries"]:
            prompt += f"- {log_entry}\n"
        
        prompt += "\nYour active Pokémon's moves:\n"
        
        for i, move in enumerate(active_pokemon["moves"]):
            prompt += f"{i}. {move['name']} - Type: {move['type']}, Power: {move['power']}, Accuracy: {move['accuracy']}\n"
        
        if battle_state["opponent_known_moves"]:
            prompt += "\nOpponent's known moves:\n"
            for move in battle_state["opponent_known_moves"]:
                prompt += f"- {move}\n"
        
        prompt += "\nYour team:\n"
        
        for pokemon in team_status:
            status = "Fainted" if pokemon["fainted"] else f"HP: {pokemon['current_hp']}/{pokemon['max_hp']}"
            prompt += f"{pokemon['index']}. {pokemon['name']} - {status}\n"
        
        prompt += """
            What would you like to do?
            - To attack, respond with: 
            {"Reasoning": "Your reasoning for your action", "action": {"type": "attack", "move_index": X}} where X is the index of the move (0-3)
            
            - To switch Pokémon, respond with: {"Reasoning": "Your reasoning for your action", "action": {"type": "switch", "pokemon_index": Y}} where Y is the index of the Pokémon in your team (0-5)

            Choose your action based on type advantages, remaining HP, and strategic considerations.
            Respond with ONLY the JSON object, nothing else.
            """
        
        return prompt

    def get_switch_decision_prompt(self, battle, trainer):
        """Generate a prompt for the LLM to choose which Pokémon to switch to after one faints"""
        # Get the opponent
        opponent = battle.trainer2 if trainer == battle.trainer1 else battle.trainer1
        
        team_status = trainer.get_team_status()
        opponent_pokemon = opponent.get_active_pokemon()
        
        prompt = f"""
        Your active Pokémon has fainted! You need to choose a new Pokémon to send out.

        Current situation:
        - Opponent's active Pokémon: {opponent_pokemon.name} (HP: {opponent_pokemon.current_hp}/{opponent_pokemon.stats['hp']})
        - Opponent's types: {', '.join(opponent_pokemon.types)}

        Your available Pokémon:
        """
        
        for pokemon in team_status:
            if not pokemon["fainted"]:
                status = f"HP: {pokemon['current_hp']}/{pokemon['max_hp']}"
                prompt += f"\n{pokemon['index']}. {pokemon['name']} - {status}"
                # We'll need to get the Pokémon object to access its types
                pokemon_obj = trainer.team[pokemon['index']]
                prompt += f"\n   Types: {', '.join(pokemon_obj.types)}"
                prompt += f"\n   Stats: HP {pokemon_obj.stats['hp']}, Atk {pokemon_obj.stats['attack']}, Def {pokemon_obj.stats['defense']}, "
                prompt += f"Sp.Atk {pokemon_obj.stats['sp_attack']}, Sp.Def {pokemon_obj.stats['sp_defense']}, Speed {pokemon_obj.stats['speed']}\n"
        
        prompt += """
        Choose which Pokémon to send out based on type advantages, remaining HP, and strategic considerations.
        Respond with: {"Reasoning": "Your reasoning for choosing this Pokémon", "action": {"type": "switch", "pokemon_index": Y}} where Y is the index of the Pokémon you want to send out.
        """
        
        return prompt

    def llm_call(self, llm, prompt):
        """Make a call to the OpenAI API and return the response"""
        try:
            if llm.startswith("claude"):
                client = OpenAI(
                    api_key=os.getenv("ANTHROPIC_API_KEY"),
                    base_url="https://api.anthropic.com/v1/"
                )
            elif llm.startswith("deepseek"):
                client = OpenAI(
                    api_key=os.getenv("DEEPSEEK_API_KEY"),
                    base_url="https://api.deepseek.com"
                )
            elif llm.startswith("gemini"):
                client = OpenAI(
                    api_key=os.getenv("GEMINI_API_KEY"), 
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
                )
            else:
                client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model=llm,
                messages=[
                    {"role": "system", "content": "You are an aspiring Pokémon trainer. Respond only with the requested JSON format. Do not include any markdown formatting or code blocks - provide just the raw JSON object."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
                # temperature=0.7,
                # max_tokens=100
            )
            
            # Extract the response text
            response_text = response.choices[0].message.content.strip()
            # print(response_text)
            # Parse the JSON response
            # Try parsing as JSON first
            try:
                action = json.loads(response_text)
                # Check if this is a team selection prompt
                if "What would you like to do?" not in prompt and "Your active Pokémon has fainted" not in prompt:
                    if isinstance(action, dict) and "team" in action and isinstance(action["team"], list):
                        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'output', 'llm_reasoning.txt')
                        with open(output_path, "a") as f:
                            f.write(f"{llm}'s Reasoning: {action['Reasoning']}\n\n")
                        print(action["team"])
                        return action["team"]
                    else:
                        print("Default team selected by llm: ", llm)
                        return [0, 1, 2, 3, 4, 5]  # Default team indices
                # Check if this is a switch decision prompt
                elif "Your active Pokémon has fainted" in prompt:
                    if isinstance(action, dict) and "action" in action:
                        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'output', 'llm_reasoning.txt')
                        with open(output_path, "a") as f:
                            f.write(f"{llm}'s Reasoning: {action['Reasoning']}\n\n")
                        print(action["action"])
                        return action["action"]
                    else:
                        return {"type": "switch", "pokemon_index": 0}  # Default switch action
                # Otherwise it's a battle action prompt
                else:
                    if isinstance(action, dict) and "action" in action:
                        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'output', 'llm_reasoning.txt')
                        with open(output_path, "a") as f:
                            f.write(f"{llm}'s Reasoning: {action['Reasoning']}\n\n")
                        print(action["action"])
                        return action["action"]
                    else:
                        return {"type": "attack", "move_index": 0}  # Default battle action
                    
            except json.JSONDecodeError:
                print(f"Failed to parse LLM response: {response_text}")
                # Return default based on prompt type
                if "What would you like to do?" in prompt:
                    return {"type": "attack", "move_index": 0}
                elif "Your active Pokémon has fainted" in prompt:
                    return {"type": "switch", "pokemon_index": 0}
                else:
                    print("Default team selection")
                    return [0, 1, 2, 3, 4, 5]
                    
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            if "What would you like to do?" in prompt:
                return {"type": "attack", "move_index": 0}
            elif "Your active Pokémon has fainted" in prompt:
                return {"type": "switch", "pokemon_index": 0}
            else:
                return [0, 1, 2, 3, 4, 5]