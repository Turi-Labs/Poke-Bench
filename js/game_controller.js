class GameController {
    constructor(pokemonData, battleMechanics, uiManager) {
        this.pokemonData = pokemonData;
        this.battleMechanics = battleMechanics;
        this.uiManager = uiManager;

        // Team setup phase
        this.player1SelectedTeam = [];
        this.player2SelectedTeam = [];
        this.player1SelectedPokemon = new Set();
        this.player2SelectedPokemon = new Set();

        // Battle phase
        this.player1Team = [];
        this.player2Team = [];
        this.player1ActiveIndex = 0;
        this.player2ActiveIndex = 0;
        this.currentPlayerTurn = 'player1'; // player1 or player2
        this.battleInProgress = false;
        this.isSwitching = false;
        this.forcedSwitch = false;
    }

    // Player name setup
    setPlayerNames() {
        const player1Name = document.getElementById('player1-name-input').value.trim() || "Player 1";
        const player2Name = document.getElementById('player2-name-input').value.trim() || "Player 2";

        this.uiManager.setPlayerNames(player1Name, player2Name);
        this.uiManager.showPlayer1TeamSetup();
        this.initTeamSelection('player1');
    }

    // Team Setup Phase
    initTeamSelection(player) {
        if (player === 'player1') {
            this.uiManager.displayPokemonList('player1', this.pokemonData, this.player1SelectedPokemon,
                (key) => this.selectPokemon('player1', key));
        } else {
            this.uiManager.displayPokemonList('player2', this.pokemonData, this.player2SelectedPokemon,
                (key) => this.selectPokemon('player2', key));
        }
    }

    selectPokemon(player, key) {
        // Don't allow more than 6 Pokemon
        const team = player === 'player1' ? this.player1SelectedTeam : this.player2SelectedTeam;
        const selectedSet = player === 'player1' ? this.player1SelectedPokemon : this.player2SelectedPokemon;

        if (team.length >= 6) {
            alert("You can only select 6 Pokemon!");
            return;
        }

        // Add to team
        const pokemon = {...this.pokemonData[key]};
        team.push(pokemon);
        selectedSet.add(key);

        // Update UI
        this.uiManager.updateSelectedTeam(player, team);

        // Enable confirm button if 6 Pokemon are selected
        if (team.length === 6) {
            this.uiManager.enableTeamConfirmButton(player);
        }

        // Mark the selected Pokemon in the list
        const option = document.querySelector(`.pokemon-option[data-key="${key}"]`);
        if (option) {
            option.classList.add('selected');
            option.style.pointerEvents = 'none';
        }
    }

    confirmTeam(player) {
        if (player === 'player1') {
            // Move to Player 2 team selection
            this.uiManager.showPlayer2TeamSetup();
            this.initTeamSelection('player2');
        } else {
            // Start the battle
            this.startBattle();
        }
    }

    startBattle() {
        // Create player teams with current HP
        this.player1Team = this.player1SelectedTeam.map(pokemon => {
            return {
                ...pokemon,
                currentHP: pokemon.hp
            };
        });

        this.player2Team = this.player2SelectedTeam.map(pokemon => {
            return {
                ...pokemon,
                currentHP: pokemon.hp
            };
        });

        // Set active Pokemon
        this.player1ActiveIndex = 0;
        this.player2ActiveIndex = 0;

        // Start battle with Player 1's turn
        this.battleInProgress = true;
        this.currentPlayerTurn = 'player1';

        // Switch to battle phase
        this.uiManager.showBattlePhase();

        // Update battle UI
        this.updateBattleUI();

        // Add log entries
        this.uiManager.resetBattleLog();
        this.uiManager.addLogEntry(`${this.player1Team[0].name} and ${this.player2Team[0].name} are ready to battle!`);
        this.updateTurnStatus();
    }

    // Battle Phase
    updateBattleUI() {
        const player1Active = this.player1Team[this.player1ActiveIndex];
        const player2Active = this.player2Team[this.player2ActiveIndex];

        this.uiManager.updateActivePokemon('player1', player1Active, player1Active.currentHP);
        this.uiManager.updateActivePokemon('player2', player2Active, player2Active.currentHP);

        // Update move buttons for both players
        this.uiManager.updateMoves('player1', player1Active, (move) => this.useMove('player1', move));
        this.uiManager.updateMoves('player2', player2Active, (move) => this.useMove('player2', move));

        // Update team icons
        this.uiManager.updateTeamIcons(
            this.player1Team,
            this.player2Team,
            this.player1ActiveIndex,
            this.player2ActiveIndex
        );

        // Update controls based on whose turn it is
        if (this.battleInProgress) {
            this.updatePlayerControls();
        }
    }

    updatePlayerControls() {
        // Disable controls for player whose turn it isn't
        if (this.currentPlayerTurn === 'player1') {
            this.uiManager.enablePlayerControls('player1');
            this.uiManager.disablePlayerControls('player2');
            this.uiManager.updateTurnIndicator('player1');
        } else {
            this.uiManager.enablePlayerControls('player2');
            this.uiManager.disablePlayerControls('player1');
            this.uiManager.updateTurnIndicator('player2');
        }
    }

    useMove(player, move) {
        if (player !== this.currentPlayerTurn || !this.battleInProgress || this.isSwitching) return;

        const attackingPlayer = player;
        const defendingPlayer = player === 'player1' ? 'player2' : 'player1';

        const attackingPokemon = player === 'player1'
            ? this.player1Team[this.player1ActiveIndex]
            : this.player2Team[this.player2ActiveIndex];

        const defendingPokemon = player === 'player1'
            ? this.player2Team[this.player2ActiveIndex]
            : this.player1Team[this.player1ActiveIndex];

        // Calculate damage
        let damage = this.battleMechanics.calculateDamage(
            move,
            attackingPokemon.type,
            defendingPokemon.type
        );

        defendingPokemon.currentHP = Math.max(0, defendingPokemon.currentHP - damage);

        // Update UI
        this.updateBattleUI();

        // Add log entries
        const attackerName = player === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;
        this.uiManager.addLogEntry(`${attackerName}'s ${attackingPokemon.name} used ${move.name}!`);

        // Check effectiveness
        const effectiveness = this.battleMechanics.getEffectiveness(move.type, defendingPokemon.type);
        const effectivenessText = this.battleMechanics.getEffectivenessText(effectiveness);
        if (effectivenessText) {
            this.uiManager.addLogEntry(effectivenessText);
        }

        this.uiManager.addLogEntry(`${defendingPokemon.name} took ${damage} damage!`);

        // Check if defending Pokemon fainted
        if (defendingPokemon.currentHP <= 0) {
            this.uiManager.addLogEntry(`${defendingPokemon.name} fainted!`);

            // Check if all defending player's Pokemon have fainted
            const defendingTeam = defendingPlayer === 'player1' ? this.player1Team : this.player2Team;
            if (this.checkTeamFainted(defendingTeam)) {
                const winnerName = attackingPlayer === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;
                const loserName = defendingPlayer === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;

                this.uiManager.addLogEntry(`All of ${loserName}'s Pokemon have fainted!`);
                this.uiManager.addLogEntry(`${winnerName} won the battle!`);
                this.uiManager.updateBattleStatus(`Battle ended - ${winnerName} won!`);

                this.uiManager.disablePlayerControls('player1');
                this.uiManager.disablePlayerControls('player2');
                this.uiManager.showRestartButton();
                this.battleInProgress = false;
                return;
            }

            // Force defending player to switch Pokemon
            this.forcedSwitch = true;
            this.currentPlayerTurn = defendingPlayer; // Switch turn to the player who needs to select a new Pokemon
            this.updatePlayerControls();

            const defenderName = defendingPlayer === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;
            this.uiManager.addLogEntry(`${defenderName} must choose a new Pokemon!`);
            this.uiManager.updateBattleStatus(`${defenderName} must switch Pokemon`);

            return;
        }

        // Switch turn to other player
        this.currentPlayerTurn = this.currentPlayerTurn === 'player1' ? 'player2' : 'player1';
        this.updatePlayerControls();
        this.updateTurnStatus();
    }

    promptPlayerSwitch(player) {
        if (player !== this.currentPlayerTurn && !this.forcedSwitch) return;

        this.isSwitching = true;
        const team = player === 'player1' ? this.player1Team : this.player2Team;
        const activeIndex = player === 'player1' ? this.player1ActiveIndex : this.player2ActiveIndex;
        const playerName = player === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;

        // Populate switch options
        this.uiManager.populateSwitchOptions(
            team,
            activeIndex,
            playerName,
            (index) => this.switchPlayerPokemon(player, index)
        );

        // Show switch modal
        this.uiManager.showSwitchModal();
    }

    switchPlayerPokemon(player, newIndex) {
        // Hide switch modal
        this.uiManager.hideSwitchModal();

        // Switch to new Pokemon
        if (player === 'player1') {
            this.player1ActiveIndex = newIndex;
        } else {
            this.player2ActiveIndex = newIndex;
        }

        // Update UI
        this.updateBattleUI();

        // Add log entry
        const playerName = player === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;
        const pokemon = player === 'player1' ? this.player1Team[newIndex] : this.player2Team[newIndex];
        this.uiManager.addLogEntry(`${playerName} sent out ${pokemon.name}!`);

        this.isSwitching = false;

        // If this was a forced switch (after fainting), maintain the current player's turn
        if (this.forcedSwitch) {
            this.forcedSwitch = false;
            // Switch turn to other player after forced switch
            this.currentPlayerTurn = this.currentPlayerTurn === 'player1' ? 'player2' : 'player1';
            this.updatePlayerControls();
            this.updateTurnStatus();
        } else {
            // If this was a voluntary switch, it uses the player's turn
            this.currentPlayerTurn = this.currentPlayerTurn === 'player1' ? 'player2' : 'player1';
            this.updatePlayerControls();
            this.updateTurnStatus();
        }
    }

    updateTurnStatus() {
        const playerName = this.currentPlayerTurn === 'player1' ? this.uiManager.player1Name : this.uiManager.player2Name;
        this.uiManager.updateBattleStatus(`${playerName}'s turn - Choose a move or switch Pokemon`);
    }

    checkTeamFainted(team) {
        return team.every(pokemon => pokemon.currentHP <= 0);
    }

    resetGame() {
        // Reset game state
        this.player1SelectedTeam = [];
        this.player2SelectedTeam = [];
        this.player1SelectedPokemon = new Set();
        this.player2SelectedPokemon = new Set();
        this.player1Team = [];
        this.player2Team = [];
        this.player1ActiveIndex = 0;
        this.player2ActiveIndex = 0;
        this.currentPlayerTurn = 'player1';
        this.battleInProgress = false;
        this.isSwitching = false;
        this.forcedSwitch = false;

        // Reset UI back to player name input
        this.uiManager.showPlayerNameInput();
        this.uiManager.hideRestartButton();
    }
}
