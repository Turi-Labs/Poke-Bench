class UIManager {
    constructor(elements) {
        this.elements = elements;
    }

    updateActivePokemon(player, pokemon, currentHP) {
        const nameEl = this.elements[`${player}Name`];
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

    updateMoves(pokemon, onMoveClick) {
        this.elements.playerMoves.innerHTML = '';
        pokemon.moves.forEach(move => {
            const moveBtn = document.createElement('button');
            moveBtn.textContent = move.name;
            moveBtn.className = `move-btn ${move.type}`;
            moveBtn.addEventListener('click', () => onMoveClick(move));
            this.elements.playerMoves.appendChild(moveBtn);
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

    disableMoves() {
        const moveButtons = this.elements.playerMoves.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
        });
    }

    enableMoves() {
        const moveButtons = this.elements.playerMoves.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = 1;
            btn.style.cursor = 'pointer';
        });
    }

    disableSwitchButton() {
        this.elements.switchButton.disabled = true;
        this.elements.switchButton.classList.add('disabled');
    }

    enableSwitchButton() {
        this.elements.switchButton.disabled = false;
        this.elements.switchButton.classList.remove('disabled');
    }

    showRestartButton() {
        this.elements.restartBtn.style.display = 'block';
    }

    hideRestartButton() {
        this.elements.restartBtn.style.display = 'none';
    }

    resetBattleLog() {
        this.elements.battleLog.innerHTML = '';
        this.addLogEntry('Welcome to Pokemon Showdown Team Battles!');
    }

    updateTeamIcons(playerTeam, opponentTeam, playerActiveIndex, opponentActiveIndex) {
        // Clear existing team icons
        this.elements.playerTeam.innerHTML = '';
        this.elements.opponentTeam.innerHTML = '';

        // Add player team icons
        playerTeam.forEach((pokemon, index) => {
            const icon = document.createElement('div');
            icon.className = `team-pokemon-icon ${index === playerActiveIndex ? 'active' : ''} ${pokemon.currentHP <= 0 ? 'fainted' : ''}`;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            icon.appendChild(img);
            this.elements.playerTeam.appendChild(icon);
        });

        // Add opponent team icons
        opponentTeam.forEach((pokemon, index) => {
            const icon = document.createElement('div');
            icon.className = `team-pokemon-icon ${index === opponentActiveIndex ? 'active' : ''} ${pokemon.currentHP <= 0 ? 'fainted' : ''}`;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            icon.appendChild(img);
            this.elements.opponentTeam.appendChild(icon);
        });
    }

    populateSwitchOptions(team, activeIndex, onSwitchSelect) {
        this.elements.switchOptions.innerHTML = '';

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

    displayPokemonList(pokemonData, onPokemonSelect) {
        this.elements.pokemonList.innerHTML = '';

        Object.entries(pokemonData).forEach(([key, pokemon]) => {
            const option = document.createElement('div');
            option.className = 'pokemon-option';
            option.dataset.key = key;

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            const name = document.createElement('span');
            name.textContent = pokemon.name;

            option.appendChild(img);
            option.appendChild(name);

            option.addEventListener('click', () => onPokemonSelect(key));

            this.elements.pokemonList.appendChild(option);
        });
    }

    updateSelectedTeam(team) {
        this.elements.selectedTeam.innerHTML = '';
        this.elements.selectedCount.textContent = team.length;

        team.forEach((pokemon, index) => {
            const selectedPokemon = document.createElement('div');
            selectedPokemon.className = 'team-pokemon-icon';

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;

            selectedPokemon.appendChild(img);
            this.elements.selectedTeam.appendChild(selectedPokemon);
        });
    }

    enableStartButton() {
        this.elements.startGameBtn.disabled = false;
    }

    disableStartButton() {
        this.elements.startGameBtn.disabled = true;
    }

    showTeamSetup() {
        this.elements.teamSetup.style.display = 'block';
        this.elements.battlePhase.style.display = 'none';
    }

    showBattlePhase() {
        this.elements.teamSetup.style.display = 'none';
        this.elements.battlePhase.style.display = 'block';
    }
}