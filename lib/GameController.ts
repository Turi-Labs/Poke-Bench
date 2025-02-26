import { BattleMechanics } from './BattleMechanics';
import { UIManager } from './UIManager';
import pokemonData from './data/pokemon';

export class GameController {
  pokemonData: any;
  battleMechanics: BattleMechanics;
  uiManager: UIManager;
  
  // Team selection
  player1SelectedTeam: any[];
  player2SelectedTeam: any[];
  player1SelectedPokemon: Set<string>;
  player2SelectedPokemon: Set<string>;
  
  // Battle state
  player1Team: any[];
  player2Team: any[];
  player1ActiveIndex: number;
  player2ActiveIndex: number;
  currentPlayerTurn: string;
  battleInProgress: boolean;
  forcedSwitch: boolean;
  
  constructor(uiManager: UIManager) {
    this.pokemonData = pokemonData;
    this.battleMechanics = new BattleMechanics();
    this.uiManager = uiManager;
    
    // Team selection
    this.player1SelectedTeam = [];
    this.player2SelectedTeam = [];
    this.player1SelectedPokemon = new Set();
    this.player2SelectedPokemon = new Set();
    
    // Battle state
    this.player1Team = [];
    this.player2Team = [];
    this.player1ActiveIndex = 0;
    this.player2ActiveIndex = 0;
    this.currentPlayerTurn = 'player1';
    this.battleInProgress = false;
    this.forcedSwitch = false;
  }
  
  resetGame() {
    // Reset team selection
    this.player1SelectedTeam = [];
    this.player2SelectedTeam = [];
    this.player1SelectedPokemon = new Set();
    this.player2SelectedPokemon = new Set();
    
    // Reset battle state
    this.player1Team = [];
    this.player2Team = [];
    this.player1ActiveIndex = 0;
    this.player2ActiveIndex = 0;
    this.currentPlayerTurn = 'player1';
    this.battleInProgress = false;
    this.forcedSwitch = false;
  }
  
  startBattle() {
    // Clone the selected teams to create battle teams
    this.player1Team = JSON.parse(JSON.stringify(this.player1SelectedTeam));
    this.player2Team = JSON.parse(JSON.stringify(this.player2SelectedTeam));
    
    // Initialize current HP for all Pokemon
    this.player1Team.forEach(pokemon => {
      pokemon.currentHP = pokemon.hp;
    });
    
    this.player2Team.forEach(pokemon => {
      pokemon.currentHP = pokemon.hp;
    });
    
    // Set active Pokemon
    this.player1ActiveIndex = 0;
    this.player2ActiveIndex = 0;
    
    // Update UI
    this.updatePokemonDisplay('player1', this.player1Team[this.player1ActiveIndex]);
    this.updatePokemonDisplay('player2', this.player2Team[this.player2ActiveIndex]);
    
    // Start battle
    this.battleInProgress = true;
    this.currentPlayerTurn = 'player1'; // Player 1 goes first
    this.forcedSwitch = false;
    
    this.uiManager.addBattleLog("Battle started!");
  }
  
  updatePokemonDisplay(playerId: string, pokemon: any) {
    // Dispatch custom event for React components to listen to
    const event = new CustomEvent('pokemonUpdate', {
      detail: {
        playerId,
        pokemon
      }
    });
    window.dispatchEvent(event);
  }
  
  updateThinkingDisplay(playerId: string, message: string) {
    // Dispatch custom event for React components to listen to
    const event = new CustomEvent('thinkingUpdate', {
      detail: {
        playerId,
        message
      }
    });
    window.dispatchEvent(event);
  }
  
  executeMove(player: string, move: any) {
    if (!this.battleInProgress || this.currentPlayerTurn !== player || this.forcedSwitch) return;
    
    const attacker = player === 'player1' ? 
      this.player1Team[this.player1ActiveIndex] : 
      this.player2Team[this.player2ActiveIndex];
        
    const defender = player === 'player1' ? 
      this.player2Team[this.player2ActiveIndex] : 
      this.player1Team[this.player1ActiveIndex];
        
    const defenderPlayer = player === 'player1' ? 'player2' : 'player1';
    
    // Calculate damage
    const result = this.battleMechanics.calculateDamage(attacker, defender, move);
    
    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - result.damage);
    
    // Update UI
    this.updatePokemonDisplay(defenderPlayer, defender);
    
    // Add battle log
    this.uiManager.addBattleLog(`${attacker.name} used ${move.name}!`);
    
    // Show effectiveness message if applicable
    const effectivenessMessage = this.battleMechanics.getEffectivenessMessage(result.effectiveness);
    if (effectivenessMessage) {
      this.uiManager.addBattleLog(effectivenessMessage);
    }
    
    // Check if defender fainted
    if (defender.currentHP <= 0) {
      this.uiManager.addBattleLog(`${defender.name} fainted!`);
      
      // Check if all Pokemon in the team have fainted
      const defenderTeam = defenderPlayer === 'player1' ? this.player1Team : this.player2Team;
      const allFainted = defenderTeam.every(pokemon => pokemon.currentHP <= 0);
      
      if (allFainted) {
        // Battle is over
        this.battleInProgress = false;
        const winner = player === 'player1' ? 
          'Player 1' : 
          'Player 2';
          
        this.uiManager.addBattleLog(`${winner} wins the battle!`);
      } else {
        // Force switch to next Pokemon
        this.forcedSwitch = true;
        this.currentPlayerTurn = defenderPlayer;
        this.uiManager.addBattleLog(`${defenderPlayer === 'player1' ? 
          'Player 1' : 
          'Player 2'} must choose a new Pokemon!`);
      }
    } else {
      // Switch turns
      this.currentPlayerTurn = defenderPlayer;
      this.uiManager.addBattleLog(`It's ${defenderPlayer === 'player1' ? 
        'Player 1' : 
        'Player 2'}'s turn!`);
    }
  }
  
  showSwitchOptions(player: string) {
    if (this.currentPlayerTurn !== player && !this.forcedSwitch) return;
    
    const team = player === 'player1' ? this.player1Team : this.player2Team;
    const activeIndex = player === 'player1' ? this.player1ActiveIndex : this.player2ActiveIndex;
    
    this.uiManager.showSwitchOptions(player, team, activeIndex);
  }
  
  switchPlayerPokemon(player: string, newIndex: number) {
    const team = player === 'player1' ? this.player1Team : this.player2Team;
    
    // Check if the Pokemon is already fainted
    if (team[newIndex].currentHP <= 0) {
      this.uiManager.addBattleLog(`${team[newIndex].name} has fainted and cannot battle!`);
      return;
    }
    
    // Update active index
    if (player === 'player1') {
      this.player1ActiveIndex = newIndex;
    } else {
      this.player2ActiveIndex = newIndex;
    }
    
    // Update UI
    this.updatePokemonDisplay(player, team[newIndex]);
    
    // Add battle log
    this.uiManager.addBattleLog(`${player === 'player1' ? 
      'Player 1' : 
      'Player 2'} switched to ${team[newIndex].name}!`);
    
    // If this was a forced switch, reset the flag and keep the turn
    if (this.forcedSwitch) {
      this.forcedSwitch = false;
    } else {
      // Otherwise, switch turns
      this.currentPlayerTurn = player === 'player1' ? 'player2' : 'player1';
      this.uiManager.addBattleLog(`It's ${this.currentPlayerTurn === 'player1' ? 
        'Player 1' : 
        'Player 2'}'s turn!`);
    }
  }
}