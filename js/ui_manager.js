class UIManager {
    constructor(elements) {
        this.elements = elements;
        this.player1Name = "Player 1";
        this.player2Name = "Player 2";
    }

    setPlayerNames(player1Name, player2Name) {
        this.player1Name = player1Name || "Player 1";
        this.player2Name = player2Name || "Player 2";

        // Update all name displays
        if (this.elements.player1Label) {
            this.elements.player1Label.textContent = this.player1Name;
        }
        if (this.elements.player2Label) {
            this.elements.player2Label.textContent = this.player2Name;
        }
        if (this.elements.player1NameDisplay) {
            this.elements.player1NameDisplay.textContent = this.player1Name;
        }
        if (this.elements.player2NameDisplay) {
            this.elements.player2NameDisplay.textContent = this.player2Name;
        }
    }

    updateActivePokemon(player, pokemon, currentHP) {
        const nameEl = this.elements[`${player}PokemonName`];
        const imgEl = this.elements[`${player}Img`];
        const healthEl = this.elements[`${player}Health`];
        const hpTextEl = this.elements[`${player}HPText`];

        nameEl.textContent = pokemon.name;
        imgEl.src = pokemon.image;
        imgEl.alt = pokemon.name;
        const healthPercent = (currentHP / pokemon.hp) * 100;
        healthEl.style.width = `${healthPercent}%`;
        hpTextEl.textContent = `HP: ${currentHP}/${pokemon.hp}`;
    }

    updateMoves(player, pokemon, onMoveClick) {
        const movesContainer = this.elements[`${player}Moves`];
        movesContainer.innerHTML = '';

        pokemon.moves.forEach(move => {
            const moveBtn = document.createElement('button');
            moveBtn.textContent = move.name;
            moveBtn.className = `move-btn ${move.type}`;
            moveBtn.addEventListener('click', () => onMoveClick(move));
            movesContainer.appendChild(moveBtn);
        });
    }

    addLogEntry(message) {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        this.elements.battleLog.appendChild(logEntry);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
    }

    updateBattleStatus(message) {
        this.elements.battleStatus.textContent = message;
    }

    updateTurnIndicator(currentPlayer) {
        const playerName = currentPlayer === 'player1' ? this.player1Name : this.player2Name;
        const colorClass = currentPlayer === 'player1' ? 'player1-color' : 'player2-color';

        this.elements.turnIndicator.innerHTML = `
            <span class="${colorClass}">${playerName}'s Turn</span>
        `;
    }

    disablePlayerControls(player) {
        // Disable moves
        const moveButtons = this.elements[`${player}Moves`].querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
        });

        // Disable switch button
        this.elements[`${player}Switch`].disabled = true;
        this.elements[`${player}Switch`].classList.add('disabled');
    }

    enablePlayerControls(player) {
        // Enable moves
        const moveButtons = this.elements[`${player}Moves`].querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = 1;
            btn.style.cursor = 'pointer';
        });

        // Enable switch button
        this.elements[`${player}Switch`].disabled = false;
        this.elements[`${player}Switch`].classList.remove('disabled');
    }

    showRestartButton() {
        this.elements.restartBtn.style.display = 'block';
    }

    hideRestartButton() {
        this.elements.restartBtn.style.display = 'none';
    }

    resetBattleLog() {
        this.elements.battleLog.innerHTML = '';
        this.addLogEntry('Welcome to Pokemon Showdown PVP Battles!');
        this.addLogEntry(`${this.player1Name} vs ${this.player2Name}. Get ready for battle!`);
    }

    updateTeamIcons(player1Team, player2Team, player1ActiveIndex, player2ActiveIndex) {
        // Clear existing team icons
        this.elements.player1Team.innerHTML = '';
        this.elements.player2Team.innerHTML = '';

        // Add player1 team icons
        player1Team.forEach((pokemon, index) => {
            const icon = document.createElement('div');
            icon.className = `team-pokemon-icon ${index === player1ActiveIndex ? 'active' : ''} ${pokemon.currentHP <= 0 ? 'fainted' : ''}`;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            icon.appendChild(img);
            this.elements.player1Team.appendChild(icon);
        });

        // Add player2 team icons
        player2Team.forEach((pokemon, index) => {
            const icon = document.createElement('div');
            icon.className = `team-pokemon-icon ${index === player2ActiveIndex ? 'active' : ''} ${pokemon.currentHP <= 0 ? 'fainted' : ''}`;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            icon.appendChild(img);
            this.elements.player2Team.appendChild(icon);
        });
    }

    populateSwitchOptions(team, activeIndex, playerName, onSwitchSelect) {
        this.elements.switchOptions.innerHTML = '';

        // Update modal title to include player name
        const modalTitle = document.querySelector('.modal-title');
        modalTitle.textContent = `${playerName}, Switch Pokemon`;

        team.forEach((pokemon, index) => {
            if (index !== activeIndex && pokemon.currentHP > 0) {
                const option = document.createElement('div');
                option.className = 'switch-option';

                const img = document.createElement('img');
                img.src = pokemon.image;
                img.alt = pokemon.name;

                const name = document.createElement('div');
                name.textContent = pokemon.name;

                const hp = document.createElement('div');
                hp.textContent = `HP: ${pokemon.currentHP}/${pokemon.hp}`;

                option.appendChild(img);
                option.appendChild(name);
                option.appendChild(hp);

                option.addEventListener('click', () => onSwitchSelect(index));

                this.elements.switchOptions.appendChild(option);
            }
        });

        // If no valid switch options, show a message
        if (this.elements.switchOptions.children.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No available Pokemon to switch to!';
            message.style.textAlign = 'center';
            message.style.gridColumn = '1 / -1';
            this.elements.switchOptions.appendChild(message);
        }
    }

    showSwitchModal() {
        this.elements.switchModal.style.display = 'block';
    }

    hideSwitchModal() {
        this.elements.switchModal.style.display = 'none';
    }

    displayPokemonList(player, pokemonData, selectedPokemon, onPokemonSelect) {
        const pokemonList = this.elements[`${player}PokemonList`];
        pokemonList.innerHTML = '';

        Object.entries(pokemonData).forEach(([key, pokemon]) => {
            const option = document.createElement('div');
            option.className = 'pokemon-option';
            if (selectedPokemon.has(key)) {
                option.classList.add('selected');
                option.style.pointerEvents = 'none';
            }
            option.dataset.key = key;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            const name = document.createElement('span');
            name.textContent = pokemon.name;

            option.appendChild(img);
            option.appendChild(name);

            option.addEventListener('click', () => {
                if (!selectedPokemon.has(key)) {
                    onPokemonSelect(key);
                }
            });

            pokemonList.appendChild(option);
        });
    }

    updateSelectedTeam(player, team) {
        const selectedTeam = this.elements[`${player}SelectedTeam`];
        const selectedCount = this.elements[`${player}SelectedCount`];

        selectedTeam.innerHTML = '';
        selectedCount.textContent = team.length;

        team.forEach(pokemon => {
            const selectedPokemon = document.createElement('div');
            selectedPokemon.className = 'team-pokemon-icon';

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            selectedPokemon.appendChild(img);
            selectedTeam.appendChild(selectedPokemon);
        });
    }

    enableTeamConfirmButton(player) {
        this.elements[`${player}ConfirmTeam`].disabled = false;
    }

    disableTeamConfirmButton(player) {
        this.elements[`${player}ConfirmTeam`].disabled = true;
    }

    showPlayerNameInput() {
        this.elements.playerNames.style.display = 'block';
        this.elements.player1TeamSetup.style.display = 'none';
        this.elements.player2TeamSetup.style.display = 'none';
        this.elements.battlePhase.style.display = 'none';
    }

    showPlayer1TeamSetup() {
        this.elements.playerNames.style.display = 'none';
        this.elements.player1TeamSetup.style.display = 'block';
        this.elements.player2TeamSetup.style.display = 'none';
        this.elements.battlePhase.style.display = 'none';
    }

    showPlayer2TeamSetup() {
        this.elements.playerNames.style.display = 'none';
        this.elements.player1TeamSetup.style.display = 'none';
        this.elements.player2TeamSetup.style.display = 'block';
        this.elements.battlePhase.style.display = 'none';
    }

    showBattlePhase() {
        this.elements.playerNames.style.display = 'none';
        this.elements.player1TeamSetup.style.display = 'none';
        this.elements.player2TeamSetup.style.display = 'none';
        this.elements.battlePhase.style.display = 'block';
    }
}
