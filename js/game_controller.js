class GameController {
    constructor(pokemonData, battleMechanics, uiManager) {
        this.pokemonData = pokemonData;
        this.battleMechanics = battleMechanics;
        this.uiManager = uiManager;

        // Team setup phase
        this.selectedTeam = [];

        // Battle phase
        this.playerTeam = [];
        this.opponentTeam = [];
        this.playerActiveIndex = 0;
        this.opponentActiveIndex = 0;
        this.isPlayerTurn = true;
        this.battleInProgress = false;
        this.isSwitching = false;
    }

    // Team Setup Phase
    initTeamSelection() {
        this.uiManager.displayPokemonList(this.pokemonData, (key) => this.selectPokemon(key));
    }

    selectPokemon(key) {
        // Don't allow more than 6 Pokemon
        if (this.selectedTeam.length >= 6) {
            alert("You can only select 6 Pokemon!");
            return;
        }

        // Add to team
        const pokemon = {...this.pokemonData[key]};
        this.selectedTeam.push(pokemon);

        // Update UI
        this.uiManager.updateSelectedTeam(this.selectedTeam);

        // Enable start button if 6 Pokemon are selected
        if (this.selectedTeam.length === 6) {
            this.uiManager.enableStartButton();
        }

        // Disable the selected Pokemon in the list
        const option = document.querySelector(`.pokemon-option[data-key="${key}"]`);
        if (option) {
            option.classList.add('selected');
            option.style.pointerEvents = 'none';
        }
    }

    startBattle() {
        // Create player team
        this.playerTeam = this.selectedTeam.map(pokemon => {
            return {
                ...pokemon,
                currentHP: pokemon.hp
            };
        });

        // Create random opponent team
        const availablePokemon = Object.keys(this.pokemonData);
        this.opponentTeam = [];

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * availablePokemon.length);
            const key = availablePokemon[randomIndex];
            const pokemon = {...this.pokemonData[key], currentHP: this.pokemonData[key].hp};
            this.opponentTeam.push(pokemon);

            // Remove from available list to prevent duplicates
            availablePokemon.splice(randomIndex, 1);
        }

        // Set active Pokemon
        this.playerActiveIndex = 0;
        this.opponentActiveIndex = 0;

        // Start battle
        this.battleInProgress = true;
        this.isPlayerTurn = true;

        // Switch to battle phase
        this.uiManager.showBattlePhase();

        // Update battle UI
        this.updateBattleUI();

        // Add log entries
        this.uiManager.addLogEntry(`Battle started! ${this.playerTeam[0].name} vs ${this.opponentTeam[0].name}`);
        this.uiManager.addLogEntry(`It's your turn! Select a move to attack or switch Pokemon.`);
        this.uiManager.updateBattleStatus(`Battle in progress - Your turn`);
    }

    // Battle Phase
    updateBattleUI() {
        const playerActive = this.playerTeam[this.playerActiveIndex];
        const opponentActive = this.opponentTeam[this.opponentActiveIndex];

        this.uiManager.updateActivePokemon('player', playerActive, playerActive.currentHP);
        this.uiManager.updateActivePokemon('opponent', opponentActive, opponentActive.currentHP);
        this.uiManager.updateMoves(playerActive, (move) => this.useMove(move));
        this.uiManager.updateTeamIcons(
            this.playerTeam,
            this.opponentTeam,
            this.playerActiveIndex,
            this.opponentActiveIndex
        );
    }

    useMove(move) {
        if (!this.isPlayerTurn || !this.battleInProgress || this.isSwitching) return;

        const playerActive = this.playerTeam[this.playerActiveIndex];
        const opponentActive = this.opponentTeam[this.opponentActiveIndex];

        // Calculate damage
        let damage = this.battleMechanics.calculateDamage(
            move,
            playerActive.type,
            opponentActive.type
        );
        opponentActive.currentHP = Math.max(0, opponentActive.currentHP - damage);

        // Update UI
        this.updateBattleUI();

        // Add log entries
        this.uiManager.addLogEntry(`${playerActive.name} used ${move.name}!`);

        // Check effectiveness
        const effectiveness = this.battleMechanics.getEffectiveness(move.type, opponentActive.type);
        const effectivenessText = this.battleMechanics.getEffectivenessText(effectiveness);
        if (effectivenessText) {
            this.uiManager.addLogEntry(effectivenessText);
        }

        this.uiManager.addLogEntry(`${opponentActive.name} took ${damage} damage!`);

        // Check if opponent fainted
        if (opponentActive.currentHP <= 0) {
            this.uiManager.addLogEntry(`${opponentActive.name} fainted!`);

            // Check if all opponent Pokemon have fainted
            if (this.checkTeamFainted(this.opponentTeam)) {
                this.uiManager.addLogEntry(`All opponent's Pokemon have fainted!`);
                this.uiManager.addLogEntry(`You won the battle!`);
                this.uiManager.updateBattleStatus(`Battle ended - You won!`);
                this.uiManager.disableMoves();
                this.uiManager.disableSwitchButton();
                this.uiManager.showRestartButton();
                this.battleInProgress = false;
                return;
            }

            // Opponent needs to switch Pokemon
            this.switchOpponentPokemon();
            return;
        }

        // Opponent's turn
        this.isPlayerTurn = false;
        this.uiManager.updateBattleStatus(`Battle in progress - Opponent's turn`);
        this.uiManager.disableMoves();
        this.uiManager.disableSwitchButton();

        setTimeout(() => {
            this.opponentTurn();
        }, 1500);
    }

    opponentTurn() {
        if (!this.battleInProgress) return;

        const opponentActive = this.opponentTeam[this.opponentActiveIndex];
        const playerActive = this.playerTeam[this.playerActiveIndex];

        // Choose random move
        const randomMove = opponentActive.moves[
            Math.floor(Math.random() * opponentActive.moves.length)
        ];

        // Calculate damage
        let damage = this.battleMechanics.calculateDamage(
            randomMove,
            opponentActive.type,
            playerActive.type
        );
        playerActive.currentHP = Math.max(0, playerActive.currentHP - damage);

        // Update UI
        this.updateBattleUI();

        // Add log entries
        this.uiManager.addLogEntry(`${opponentActive.name} used ${randomMove.name}!`);

        // Check effectiveness
        const effectiveness = this.battleMechanics.getEffectiveness(randomMove.type, playerActive.type);
        const effectivenessText = this.battleMechanics.getEffectivenessText(effectiveness);
        if (effectivenessText) {
            this.uiManager.addLogEntry(effectivenessText);
        }

        this.uiManager.addLogEntry(`${playerActive.name} took ${damage} damage!`);

        // Check if player fainted
        if (playerActive.currentHP <= 0) {
            this.uiManager.addLogEntry(`${playerActive.name} fainted!`);

            // Check if all player Pokemon have fainted
            if (this.checkTeamFainted(this.playerTeam)) {
                this.uiManager.addLogEntry(`All your Pokemon have fainted!`);
                this.uiManager.addLogEntry(`You lost the battle!`);
                this.uiManager.updateBattleStatus(`Battle ended - You lost!`);
                this.uiManager.disableMoves();
                this.uiManager.disableSwitchButton();
                this.uiManager.showRestartButton();
                this.battleInProgress = false;
                return;
            }

            // Force player to switch Pokemon
            this.uiManager.addLogEntry(`You must switch to another Pokemon!`);
            this.promptPlayerSwitch(true);
            return;
        }

        // Player's turn
        this.isPlayerTurn = true;
        this.uiManager.updateBattleStatus(`Battle in progress - Your turn`);
        this.uiManager.enableMoves();
        this.uiManager.enableSwitchButton();
        this.uiManager.addLogEntry(`It's your turn! Select a move to attack or switch Pokemon.`);
    }

    switchOpponentPokemon() {
        // Find a non-fainted Pokemon
        const availablePokemon = this.opponentTeam
            .map((pokemon, index) => ({ pokemon, index }))
            .filter(item => item.pokemon.currentHP > 0 && item.index !== this.opponentActiveIndex);

        if (availablePokemon.length === 0) {
            // This shouldn't happen as we check for team fainted earlier
            return;
        }

        // Choose random Pokemon
        const randomSwitch = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
        this.opponentActiveIndex = randomSwitch.index;

        // Update UI
        this.updateBattleUI();

        // Add log entry
        this.uiManager.addLogEntry(`Opponent sent out ${this.opponentTeam[this.opponentActiveIndex].name}!`);

        // Continue with player's turn
        this.isPlayerTurn = true;
        this.uiManager.updateBattleStatus(`Battle in progress - Your turn`);
        this.uiManager.enableMoves();
        this.uiManager.enableSwitchButton();
    }

    promptPlayerSwitch(forced = false) {
        this.isSwitching = true;

        // Populate switch options
        this.uiManager.populateSwitchOptions(
            this.playerTeam,
            this.playerActiveIndex,
            (index) => this.switchPlayerPokemon(index, forced)
        );

        // Show switch modal
        this.uiManager.showSwitchModal();
    }

    switchPlayerPokemon(newIndex, forced = false) {
        // Hide switch modal
        this.uiManager.hideSwitchModal();

        // Switch to new Pokemon
        this.playerActiveIndex = newIndex;

        // Update UI
        this.updateBattleUI();

        // Add log entry
        this.uiManager.addLogEntry(`You sent out ${this.playerTeam[this.playerActiveIndex].name}!`);

        this.isSwitching = false;

        // If this was a forced switch (after fainting), opponent's turn
        if (forced) {
            this.isPlayerTurn = false;
            this.uiManager.updateBattleStatus(`Battle in progress - Opponent's turn`);
            this.uiManager.disableMoves();
            this.uiManager.disableSwitchButton();

            setTimeout(() => {
                this.opponentTurn();
            }, 1500);
        } else {
            // If this was a voluntary switch, it uses the player's turn
            this.isPlayerTurn = false;
            this.uiManager.updateBattleStatus(`Battle in progress - Opponent's turn`);
            this.uiManager.disableMoves();
            this.uiManager.disableSwitchButton();

            setTimeout(() => {
                this.opponentTurn();
            }, 1500);
        }
    }

    checkTeamFainted(team) {
        return team.every(pokemon => pokemon.currentHP <= 0);
    }

    resetGame() {
        // Reset game state
        this.selectedTeam = [];
        this.playerTeam = [];
        this.opponentTeam = [];
        this.playerActiveIndex = 0;
        this.opponentActiveIndex = 0;
        this.isPlayerTurn = true;
        this.battleInProgress = false;
        this.isSwitching = false;

        // Reset UI
        this.uiManager.showTeamSetup();
        this.uiManager.hideRestartButton();
        this.uiManager.resetBattleLog();
        this.uiManager.updateSelectedTeam([]);
        this.uiManager.disableStartButton();

        // Reset pokemon selection
        const options = document.querySelectorAll('.pokemon-option.selected');
        options.forEach(option => {
            option.classList.remove('selected');
            option.style.pointerEvents = 'auto';
        });
    }
}