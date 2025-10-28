import { GameController } from './GameController';
import { UIManager } from './UIManager';
import { callLLM } from './llm';

export class LLMBattleController {
  gameController: GameController;
  uiManager: UIManager;
  autoBattleInterval: any;
  isAutoBattling: boolean;
  moveDelay: number;
  
  // LLM configurations
  llm1: {
    model: string;
    name: string;
  };
  
  llm2: {
    model: string;
    name: string;
  };
  
  constructor(gameController: GameController, uiManager: UIManager) {
    this.gameController = gameController;
    this.uiManager = uiManager;
    this.autoBattleInterval = null;
    this.isAutoBattling = false;
    this.moveDelay = 2000; // Default delay between moves in ms
    
    // LLM configurations
    this.llm1 = {
      model: "random",
      name: "ClaudeBot"
    };
    
    this.llm2 = {
      model: "random",
      name: "RandomBot"
    };
    
    // Load settings from localStorage if available
    this.loadSettings();
  }
  
  loadSettings() {
    try {
      const settings = localStorage.getItem('battleSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        
        this.llm1 = parsedSettings.llm1 || this.llm1;
        this.llm2 = parsedSettings.llm2 || this.llm2;
        this.moveDelay = parsedSettings.moveDelay || this.moveDelay;
      }
    } catch (error) {
      console.error('Error loading battle settings:', error);
    }
  }
  
  startBattle() {
    // Auto-select teams for both LLMs
    this.selectRandomTeams();
    
    // Initialize battle
    this.gameController.startBattle();
    
    // Force immediate update of Pokemon displays
    this.updateInitialPokemonDisplays();
    
    // Update thinking displays
    this.gameController.updateThinkingDisplay('player1', 'Analyzing battle state...');
    this.gameController.updateThinkingDisplay('player2', 'Waiting for turn...');
  }
  
  updateInitialPokemonDisplays() {
    // Explicitly update both Pokemon displays to ensure they appear immediately
    if (this.gameController.player1Team.length > 0 && this.gameController.player2Team.length > 0) {
      const player1Pokemon = this.gameController.player1Team[this.gameController.player1ActiveIndex];
      const player2Pokemon = this.gameController.player2Team[this.gameController.player2ActiveIndex];
      
      // Use a small timeout to ensure the components are mounted
      setTimeout(() => {
        this.gameController.updatePokemonDisplay('player1', player1Pokemon);
        this.gameController.updatePokemonDisplay('player2', player2Pokemon);
        
        // Add a battle log entry to confirm initialization
        this.uiManager.addBattleLog(`${player1Pokemon.name} and ${player2Pokemon.name} are ready to battle!`);
      }, 100);
    }
  }
  
  selectRandomTeams() {
    // Get all Pokemon keys
    const pokemonKeys = Object.keys(this.gameController.pokemonData);
    
    // Select random teams
    const selectRandomTeam = () => {
      const teamKeys = new Set<string>();
      while(teamKeys.size < 6) {
        const randomIndex = Math.floor(Math.random() * pokemonKeys.length);
        teamKeys.add(pokemonKeys[randomIndex]);
      }
      return Array.from(teamKeys);
    };
    
    // Create team 1
    const team1Keys = selectRandomTeam();
    team1Keys.forEach(key => {
      this.gameController.player1SelectedTeam.push({...this.gameController.pokemonData[key]});
      this.gameController.player1SelectedPokemon.add(key);
    });
    
    // Create team 2
    const team2Keys = selectRandomTeam();
    team2Keys.forEach(key => {
      this.gameController.player2SelectedTeam.push({...this.gameController.pokemonData[key]});
      this.gameController.player2SelectedPokemon.add(key);
    });
    
    console.log(`${this.llm1.name} team:`, this.gameController.player1SelectedTeam.map(p => p.name));
    console.log(`${this.llm2.name} team:`, this.gameController.player2SelectedTeam.map(p => p.name));
  }
  
  executeNextMove() {
    if (!this.gameController.battleInProgress) return;
    
    const currentPlayer = this.gameController.currentPlayerTurn;
    const llm = currentPlayer === 'player1' ? this.llm1 : this.llm2;
    
    // Update thinking display
    this.gameController.updateThinkingDisplay(currentPlayer, 'Analyzing battle state and choosing next move...');
    
    // Get battle state for decision making
    const battleState = this.getBattleState();
    
    // Determine if we need to switch Pokemon (forced after fainting)
    if (this.gameController.forcedSwitch) {
      // Simulate LLM thinking
      setTimeout(() => {
        try {
          // Get LLM switch decision - synchronous call
          const switchDecision = this.getLLMSwitchDecision(llm, battleState);
          
          // Update thinking display with decision
          this.gameController.updateThinkingDisplay(currentPlayer, switchDecision.reasoning);
          
          // Execute the switch
          setTimeout(() => {
            this.gameController.switchPlayerPokemon(currentPlayer, switchDecision.index);
            
            // If auto battling, continue
            if (this.isAutoBattling) {
              setTimeout(() => this.executeNextMove(), this.moveDelay);
            }
          }, 1000);
        } catch (error) {
          console.error("Error getting switch decision:", error);
          // Fallback to random switch
          const randomIndex = this.getRandomAvailablePokemonIndex(currentPlayer);
          this.gameController.updateThinkingDisplay(currentPlayer, "Error occurred. Choosing random Pokemon.");
          setTimeout(() => {
            this.gameController.switchPlayerPokemon(currentPlayer, randomIndex);
            if (this.isAutoBattling) {
              setTimeout(() => this.executeNextMove(), this.moveDelay);
            }
          }, 1000);
        }
      }, 1000);
      
      return;
    }
    
    // Get LLM decision
    setTimeout(() => {
      try {
        // Get LLM decision - synchronous call
        const decision = this.getLLMDecision(llm, battleState);
        
        // Update thinking display
        this.gameController.updateThinkingDisplay(currentPlayer, decision.reasoning);
        
        // Execute the decision
        setTimeout(() => {
          if (decision.action === 'move') {
            // Find the move in the active Pokemon's moves
            const activePokemon = currentPlayer === 'player1' 
              ? this.gameController.player1Team[this.gameController.player1ActiveIndex]
              : this.gameController.player2Team[this.gameController.player2ActiveIndex];
              
            const moveToUse = activePokemon.moves.find((m: any) => m.name === decision.moveName);
            
            if (moveToUse) {
              this.gameController.executeMove(currentPlayer, moveToUse);
            } else {
              // Fallback to random move if not found
              const randomMove = activePokemon.moves[Math.floor(Math.random() * activePokemon.moves.length)];
              this.gameController.executeMove(currentPlayer, randomMove);
            }
          } else if (decision.action === 'switch') {
            // Execute switch
            const newIndex = decision.specificIndex !== undefined 
              ? decision.specificIndex 
              : this.getRandomAvailablePokemonIndex(currentPlayer);
              
            this.gameController.switchPlayerPokemon(currentPlayer, newIndex);
          }
          
          // If auto battling, continue
          if (this.isAutoBattling) {
            setTimeout(() => this.executeNextMove(), this.moveDelay);
          }
        }, 1000);
      } catch (error) {
        console.error("Error getting decision:", error);
        // Fallback to random move
        const activePokemon = currentPlayer === 'player1' 
          ? this.gameController.player1Team[this.gameController.player1ActiveIndex]
          : this.gameController.player2Team[this.gameController.player2ActiveIndex];
        const randomMove = activePokemon.moves[Math.floor(Math.random() * activePokemon.moves.length)];
        
        this.gameController.updateThinkingDisplay(currentPlayer, "Error occurred. Choosing random move.");
        
        setTimeout(() => {
          this.gameController.executeMove(currentPlayer, randomMove);
          if (this.isAutoBattling) {
            setTimeout(() => this.executeNextMove(), this.moveDelay);
          }
        }, 1000);
      }
    }, 1000);
  }
  
  getRandomAvailablePokemonIndex(player: string) {
    const team = player === 'player1' 
      ? this.gameController.player1Team 
      : this.gameController.player2Team;
      
    const activeIndex = player === 'player1' 
      ? this.gameController.player1ActiveIndex 
      : this.gameController.player2ActiveIndex;
      
    // Find available Pokemon (not active and not fainted)
    const availableIndices = team
      .map((pokemon, index) => ({ pokemon, index }))
      .filter(({ pokemon, index }) => index !== activeIndex && pokemon.currentHP > 0)
      .map(({ index }) => index);
      
    if (availableIndices.length === 0) return activeIndex;
    
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  }
  
  getBattleState() {
    const player1Active = this.gameController.player1Team[this.gameController.player1ActiveIndex];
    const player2Active = this.gameController.player2Team[this.gameController.player2ActiveIndex];
    
    return {
      player1: {
        name: this.llm1.name,
        activePokemon: {
          name: player1Active.name,
          type: player1Active.type,
          currentHP: player1Active.currentHP,
          maxHP: player1Active.hp,
          moves: player1Active.moves
        },
        team: this.gameController.player1Team.map(p => ({
          name: p.name,
          type: p.type,
          currentHP: p.currentHP,
          maxHP: p.hp
        }))
      },
      player2: {
        name: this.llm2.name,
        activePokemon: {
          name: player2Active.name,
          type: player2Active.type,
          currentHP: player2Active.currentHP,
          maxHP: player2Active.hp,
          moves: player2Active.moves
        },
        team: this.gameController.player2Team.map(p => ({
          name: p.name,
          type: p.type,
          currentHP: p.currentHP,
          maxHP: p.hp
        }))
      },
      currentTurn: this.gameController.currentPlayerTurn
    };
  }
  
  getLLMDecision(llm: any, battleState: any) {
    const isPlayer1 = battleState.currentTurn === 'player1';
    const activePokemon = isPlayer1 ? battleState.player1.activePokemon : battleState.player2.activePokemon;
    const opponentPokemon = isPlayer1 ? battleState.player2.activePokemon : battleState.player1.activePokemon;
    
    // For random model, just return a random move or occasionally switch
    if (llm.model === 'random') {
      const shouldSwitch = Math.random() < 0.2; // 20% chance to switch
      
      if (shouldSwitch) {
        return {
          action: 'switch',
          reasoning: `Randomly decided to switch Pokemon.`,
          specificIndex: undefined // Random choice
        };
      } else {
        const randomMove = activePokemon.moves[Math.floor(Math.random() * activePokemon.moves.length)];
        return {
          action: 'move',
          moveName: randomMove.name,
          reasoning: `Randomly selected move: ${randomMove.name}`
        };
      }
    }
    
    // For OpenAI model, call the API
    if (llm.model !== 'random') {
      const prompt = `
      You are a Pokémon battle AI assistant. Your task is to decide the next optimal move in a Pokémon battle.
  
      Battle State:
      - Your active Pokémon: ${activePokemon.name} (Type: ${activePokemon.type})
      - Your HP: ${activePokemon.currentHP}/${activePokemon.maxHP} (${Math.round((activePokemon.currentHP/activePokemon.maxHP)*100)}%)
      - Opponent's Pokémon: ${opponentPokemon.name} (Type: ${opponentPokemon.type})
      - Opponent's HP: ${opponentPokemon.currentHP}/${opponentPokemon.maxHP} (${Math.round((opponentPokemon.currentHP/opponentPokemon.maxHP)*100)}%)
  
      Your available moves:
      ${activePokemon.moves.map((move: any) => 
        `- ${move.name} (Type: ${move.type}, Power: ${move.power}, Accuracy: ${move.accuracy})`
      ).join('\n')}
  
      Opponent's available moves:
      ${opponentPokemon.moves.map((move: any) => 
        `- ${move.name} (Type: ${move.type}, Power: ${move.power}, Accuracy: ${move.accuracy})`
      ).join('\n')}
  
      Your team:
      ${isPlayer1 ? 
        battleState.player1.team.map((pokemon: any, index: number) => 
          `${index}: ${pokemon.name} (Type: ${pokemon.type}, HP: ${pokemon.currentHP}/${pokemon.maxHP})`
        ).join('\n') :
        battleState.player2.team.map((pokemon: any, index: number) => 
          `${index}: ${pokemon.name} (Type: ${pokemon.type}, HP: ${pokemon.currentHP}/${pokemon.maxHP})`
        ).join('\n')
      }
  
      Type effectiveness to consider:
      - Fire is strong against Grass, Ice, Bug, Steel
      - Water is strong against Fire, Ground, Rock
      - Electric is strong against Water, Flying
      - Grass is strong against Water, Ground, Rock
      - Ice is strong against Grass, Ground, Flying, Dragon
      - Fighting is strong against Normal, Ice, Rock, Dark, Steel
      - Poison is strong against Grass, Fairy
      - Ground is strong against Fire, Electric, Poison, Rock, Steel
      - Flying is strong against Grass, Fighting, Bug
      - Psychic is strong against Fighting, Poison
      - Bug is strong against Grass, Psychic, Dark
      - Rock is strong against Fire, Ice, Flying, Bug
      - Ghost is strong against Psychic, Ghost
      - Dragon is strong against Dragon
      - Dark is strong against Psychic, Ghost
      - Steel is strong against Ice, Rock, Fairy
      - Fairy is strong against Fighting, Dragon, Dark
  
      IMPORTANT: Respond ONLY with a valid JSON object in one of these two formats:
  
      For using a move:
      {
      "action": "move",
      "moveName": "[exact name of the move to use]",
      "reasoning": "[explanation of why this move is optimal]"
      }
  
      For switching Pokémon:
      {
      "action": "switch",
      "specificIndex": [index number of the Pokémon to switch to],
      "reasoning": "[explanation of why switching is optimal]"
      }
  
  const analyzeBattleSituation = (battleState: any): any => {
      const decision = {
        action: "",
        specificIndex: null,
        reasoning: ""
      };
  
      // Analyze the battle state to determine the optimal move or switch
      if (battleState.currentTurn % 2 === 0) {
        decision.action = "move";
        decision.reasoning = "It's an even turn, so attacking is prioritized.";
      } else {
        decision.action
      `;
  
      console.log('Calling LLM for next move decision');
      try {
        // This is a synchronous call that returns a Promise
        // We'll let the caller handle the Promise
        let response = callLLM(prompt, llm.model);
        console.log("from controller")
        console.log(response)
        return response;
      } catch (error) {
        console.error('Error calling LLM:', error);
        // Fallback to random strategy if LLM call fails
        const randomMove = activePokemon.moves[Math.floor(Math.random() * activePokemon.moves.length)];
        return {
          action: 'move',
          moveName: randomMove.name,
          reasoning: `Fallback to random move due to LLM error: ${randomMove.name}`
        };
      }
    }
    
    // Default strategy for unsupported models
    // Simple type effectiveness check
    const typeEffectiveness: any = {
      fire: { grass: 2, ice: 2, bug: 2, steel: 2 },
      water: { fire: 2, ground: 2, rock: 2 },
      electric: { water: 2, flying: 2 },
      grass: { water: 2, ground: 2, rock: 2 },
      ice: { grass: 2, ground: 2, flying: 2, dragon: 2 },
      fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2 },
      poison: { grass: 2, fairy: 2 },
      ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2 },
      flying: { grass: 2, fighting: 2, bug: 2 },
      psychic: { fighting: 2, poison: 2 },
      bug: { grass: 2, psychic: 2, dark: 2 },
      rock: { fire: 2, ice: 2, flying: 2, bug: 2 },
      ghost: { psychic: 2, ghost: 2 },
      dragon: { dragon: 2 },
      dark: { psychic: 2, ghost: 2 },
      steel: { ice: 2, rock: 2, fairy: 2 },
      fairy: { fighting: 2, dragon: 2, dark: 2 }
    };
    
    // Find the most effective move
    let bestMove = activePokemon.moves[0];
    let bestEffectiveness = 1;
    
    activePokemon.moves.forEach((move: any) => {
      const moveType = move.type.toLowerCase();
      const defenderType = opponentPokemon.type.toLowerCase();
      
      let effectiveness = 1;
      if (typeEffectiveness[moveType] && typeEffectiveness[moveType][defenderType]) {
        effectiveness = typeEffectiveness[moveType][defenderType];
      }
      
      // Consider STAB (Same Type Attack Bonus)
      if (moveType === activePokemon.type.toLowerCase()) {
        effectiveness *= 1.5;
      }
      
      // Consider move power
      const totalDamage = move.power * effectiveness;
      
      if (totalDamage > bestEffectiveness) {
        bestMove = move;
        bestEffectiveness = totalDamage;
      }
    });
    
    // Decide whether to use the best move or switch
    const hpPercentage = activePokemon.currentHP / activePokemon.maxHP;
    const shouldSwitch = hpPercentage < 0.3 && Math.random() < 0.7; // 70% chance to switch if HP is low
    
    if (shouldSwitch) {
      return {
        action: 'switch',
        reasoning: `${activePokemon.name} is low on health (${Math.round(hpPercentage * 100)}%). Switching to a healthier Pokemon.`,
        specificIndex: undefined
      };
    } else {
      return {
        action: 'move',
        moveName: bestMove.name,
        reasoning: `Using ${bestMove.name} because it's ${bestEffectiveness > 1.5 ? 'super effective' : 'the best option'} against ${opponentPokemon.name}.`
      };
    }
  }
  
  getLLMSwitchDecision(llm: any, battleState: any) {
    const isPlayer1 = battleState.currentTurn === 'player1';
    const team = isPlayer1 ? battleState.player1.team : battleState.player2.team;
    const opponent = isPlayer1 ? battleState.player2.activePokemon : battleState.player1.activePokemon;
    
    // Find available Pokemon
    const availablePokemon = team.filter((p: any) => p.currentHP > 0);
    
    if (availablePokemon.length === 0) {
      return {
        index: 0,
        reasoning: "No available Pokemon to switch to!"
      };
    }
    
    // For random model, choose randomly
    if (llm.model === 'random') {
      const randomIndex = Math.floor(Math.random() * availablePokemon.length);
      const chosenPokemon = availablePokemon[randomIndex];
      
      // Find the index in the original team
      const teamIndex = team.findIndex((p: any) => p.name === chosenPokemon.name);
      
      return {
        index: teamIndex,
        reasoning: `Randomly selected ${chosenPokemon.name} as the next Pokemon.`
      };
    }
    
    // For OpenAI model, call the API
    if (llm.model === 'openai') {
      const prompt = `
You are a Pokémon battle AI assistant. Your previous Pokémon has fainted, and you need to choose which Pokémon to send out next.

Battle State:
- Opponent's active Pokémon: ${opponent.name} (Type: ${opponent.type})
- Opponent's HP: ${opponent.currentHP}/${opponent.maxHP} (${Math.round((opponent.currentHP/opponent.maxHP)*100)}%)

Your available Pokémon (with index numbers):
${availablePokemon.map((pokemon: any) => {
  const originalIndex = team.findIndex((p: any) => p.name === pokemon.name);
  return `${originalIndex}: ${pokemon.name} (Type: ${pokemon.type}, HP: ${pokemon.currentHP}/${pokemon.maxHP})`;
}).join('\n')}

Type effectiveness to consider:
- Fire is strong against Grass, Ice, Bug, Steel
- Water is strong against Fire, Ground, Rock
- Electric is strong against Water, Flying
- Grass is strong against Water, Ground, Rock
- Ice is strong against Grass, Ground, Flying, Dragon
- Fighting is strong against Normal, Ice, Rock, Dark, Steel
- Poison is strong against Grass, Fairy
- Ground is strong against Fire, Electric, Poison, Rock, Steel
- Flying is strong against Grass, Fighting, Bug
- Psychic is strong against Fighting, Poison
- Bug is strong against Grass, Psychic, Dark
- Rock is strong against Fire, Ice, Flying, Bug
- Ghost is strong against Psychic, Ghost
- Dragon is strong against Dragon
- Dark is strong against Psychic, Ghost
- Steel is strong against Ice, Rock, Fairy
- Fairy is strong against Fighting, Dragon, Dark

IMPORTANT: Respond ONLY with a valid JSON object in this format:
{
"index": [the index number of the Pokémon you want to switch to],
"reasoning": "[detailed explanation of why you chose this Pokémon]"
}

Analyze the battle situation and provide your decision in the required JSON format.
`;

      console.log('Calling LLM for switch decision');
      try {
        // This is a synchronous call that returns a Promise
        // We'll let the caller handle the Promise
        return callLLM(prompt, llm.model);
      } catch (error) {
        console.error('Error calling LLM for switch decision:', error);
        // Fallback to random selection if LLM call fails
        const randomIndex = Math.floor(Math.random() * availablePokemon.length);
        const chosenPokemon = availablePokemon[randomIndex];
        const teamIndex = team.findIndex((p: any) => p.name === chosenPokemon.name);
        
        return {
          index: teamIndex,
          reasoning: `Fallback to random selection due to LLM error: ${chosenPokemon.name}`
        };
      }
    }
    
    // Default strategy for unsupported models
    // Simple type effectiveness check for defense
    const typeWeaknesses: any = {
      normal: { fighting: true },
      fire: { water: true, ground: true, rock: true },
      water: { electric: true, grass: true },
      electric: { ground: true },
      grass: { fire: true, ice: true, poison: true, flying: true, bug: true },
      ice: { fire: true, fighting: true, rock: true, steel: true },
      fighting: { flying: true, psychic: true, fairy: true },
      poison: { ground: true, psychic: true },
      ground: { water: true, grass: true, ice: true },
      flying: { electric: true, ice: true, rock: true },
      psychic: { bug: true, ghost: true, dark: true },
      bug: { fire: true, flying: true, rock: true },
      rock: { water: true, grass: true, fighting: true, ground: true, steel: true },
      ghost: { ghost: true, dark: true },
      dragon: { ice: true, dragon: true, fairy: true },
      dark: { fighting: true, bug: true, fairy: true },
      steel: { fire: true, fighting: true, ground: true },
      fairy: { poison: true, steel: true }
    };
    
    // Find the best Pokemon to switch to
    let bestPokemon = availablePokemon[0];
    let bestScore = -Infinity;
    
    availablePokemon.forEach((pokemon: any) => {
      let score = pokemon.currentHP / pokemon.maxHP * 100; // HP percentage
      
      // Bonus for type advantage
      const pokemonType = pokemon.type.toLowerCase();
      const opponentType = opponent.type.toLowerCase();
      
      // Check if this Pokemon resists the opponent's type
      if (typeWeaknesses[opponentType] && !typeWeaknesses[opponentType][pokemonType]) {
        score += 20;
      }
      
      // Penalty if weak to opponent's type
      if (typeWeaknesses[pokemonType] && typeWeaknesses[pokemonType][opponentType]) {
        score -= 20;
      }
      
      if (score > bestScore) {
        bestPokemon = pokemon;
        bestScore = score;
      }
    });
    
    // Find the index in the original team
    const teamIndex = team.findIndex((p: any) => p.name === bestPokemon.name);
    
    return {
      index: teamIndex,
      reasoning: `Switching to ${bestPokemon.name} because it has good HP (${Math.round(bestPokemon.currentHP / bestPokemon.maxHP * 100)}%) and ${bestScore > 100 ? 'resists' : 'can handle'} ${opponent.name}'s attacks.`
    };
  }
  
  toggleAutoBattle() {
    this.isAutoBattling = !this.isAutoBattling;
    
    if (this.isAutoBattling) {
      this.executeNextMove();
    }
  }
  
  restartBattle() {
    // Stop auto battle if running
    this.isAutoBattling = false;
    
    // Reset the game
    this.gameController.resetGame();
  }
}