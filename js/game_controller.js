class GameController {
    constructor() {
        this.pokemonData = pokemonData;
        this.battleMechanics = new BattleMechanics();
        this.uiManager = new UIManager();
        
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
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Switch buttons
        document.getElementById('player1-switch').addEventListener('click', () => {
            this.showSwitchOptions('player1');
        });
        
        document.getElementById('player2-switch').addEventListener('click', () => {
            this.showSwitchOptions('player2');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('switch-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
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
        
        // Clear battle log
        document.getElementById('battle-log').innerHTML = '';
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
        this.uiManager.updatePokemonDisplay('player1', this.player1Team[this.player1ActiveIndex]);
        this.uiManager.updatePokemonDisplay('player2', this.player2Team[this.player2ActiveIndex]);
        
        // Start battle
        this.battleInProgress = true;
        this.currentPlayerTurn = 'player1'; // Player 1 goes first
        this.forcedSwitch = false;
        
        this.uiManager.addBattleLog("Battle started!");
    }
    
    executeMove(player, move) {
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
        this.uiManager.updatePokemonDisplay(defenderPlayer, defender);
        
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
                    document.getElementById('player1-name').textContent : 
                    document.getElementById('player2-name').textContent;
                    
                this.uiManager.showBattleResult(winner);
            } else {
                // Force switch to next Pokemon
                this.forcedSwitch = true;
                this.currentPlayerTurn = defenderPlayer;
                this.uiManager.addBattleLog(`${defenderPlayer === 'player1' ? 
                    document.getElementById('player1-name').textContent : 
                    document.getElementById('player2-name').textContent} must choose a new Pokemon!`);
            }
        } else {
            // Switch turns
            this.currentPlayerTurn = defenderPlayer;
            this.uiManager.addBattleLog(`It's ${defenderPlayer === 'player1' ? 
                document.getElementById('player1-name').textContent : 
                document.getElementById('player2-name').textContent}'s turn!`);
        }
    }
    
    showSwitchOptions(player) {
        if (this.currentPlayerTurn !== player && !this.forcedSwitch) return;
        
        const team = player === 'player1' ? this.player1Team : this.player2Team;
        const activeIndex = player === 'player1' ? this.player1ActiveIndex : this.player2ActiveIndex;
        
        this.uiManager.showSwitchOptions(player, team, activeIndex);
    }
    
    switchPlayerPokemon(player, newIndex) {
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
        this.uiManager.updatePokemonDisplay(player, team[newIndex]);
        
        // Add battle log
        this.uiManager.addBattleLog(`${player === 'player1' ? 
            document.getElementById('player1-name').textContent : 
            document.getElementById('player2-name').textContent} switched to ${team[newIndex].name}!`);
        
        // If this was a forced switch, reset the flag and keep the turn
        if (this.forcedSwitch) {
            this.forcedSwitch = false;
        } else {
            // Otherwise, switch turns
            this.currentPlayerTurn = player === 'player1' ? 'player2' : 'player1';
            this.uiManager.addBattleLog(`It's ${this.currentPlayerTurn === 'player1' ? 
                document.getElementById('player1-name').textContent : 
                document.getElementById('player2-name').textContent}'s turn!`);
        }
    }
}