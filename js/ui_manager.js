class UIManager {
    constructor() {
        this.battleLog = document.getElementById('battle-log');
    }
    
    setPlayerNames(player1Name, player2Name) {
        document.getElementById('player1-name').textContent = player1Name;
        document.getElementById('player2-name').textContent = player2Name;
    }
    
    showBattlePhase() {
        document.getElementById('llm-settings').style.display = 'none';
        document.getElementById('battle-phase').style.display = 'block';
    }
    
    updatePokemonDisplay(player, pokemon) {
        const displayElement = document.getElementById(`${player}-display`);
        const spriteElement = document.getElementById(`${player}-sprite`);
        const nameElement = document.getElementById(`${player}-pokemon-name`);
        const typeElement = document.getElementById(`${player}-type`);
        const hpElement = document.getElementById(`${player}-hp`);
        const hpFillElement = document.getElementById(`${player}-hp-fill`);
        const movesContainer = document.getElementById(`${player}-moves`);
        
        // Update sprite
        spriteElement.src = pokemon.sprite;
        
        // Update name
        nameElement.textContent = pokemon.name;
        
        // Update type
        typeElement.innerHTML = `<span class="type type-${pokemon.type}">${pokemon.type}</span>`;
        
        // Update HP
        hpElement.textContent = `${pokemon.currentHP}/${pokemon.hp}`;
        const hpPercentage = (pokemon.currentHP / pokemon.hp) * 100;
        hpFillElement.style.width = `${hpPercentage}%`;
        
        // Update HP bar color based on remaining HP
        if (hpPercentage > 50) {
            hpFillElement.style.backgroundColor = '#4caf50'; // Green
        } else if (hpPercentage > 20) {
            hpFillElement.style.backgroundColor = '#ff9800'; // Orange
        } else {
            hpFillElement.style.backgroundColor = '#f44336'; // Red
        }
        
        // Update moves
        movesContainer.innerHTML = '';
        pokemon.moves.forEach(move => {
            const moveButton = document.createElement('button');
            moveButton.className = `move-btn type-${move.type}`;
            moveButton.textContent = move.name;
            moveButton.dataset.moveName = move.name;
            moveButton.addEventListener('click', () => {
                // This will be handled by the game controller
                if (window.gameController) {
                    window.gameController.executeMove(player, move);
                }
            });
            movesContainer.appendChild(moveButton);
        });
    }
    
    showSwitchOptions(player, team, activeIndex) {
        const modal = document.getElementById('switch-modal');
        const optionsContainer = document.getElementById('switch-options');
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Add options for each Pokemon in the team
        team.forEach((pokemon, index) => {
            // Skip the active Pokemon and fainted Pokemon
            if (index === activeIndex || pokemon.currentHP <= 0) return;
            
            const option = document.createElement('div');
            option.className = 'switch-option';
            option.innerHTML = `
                <img src="${pokemon.sprite}" alt="${pokemon.name}">
                <h4>${pokemon.name}</h4>
                <div class="type type-${pokemon.type}">${pokemon.type}</div>
                <div>${pokemon.currentHP}/${pokemon.hp} HP</div>
            `;
            
            option.addEventListener('click', () => {
                modal.style.display = 'none';
                if (window.gameController) {
                    window.gameController.switchPlayerPokemon(player, index);
                }
            });
            
            optionsContainer.appendChild(option);
        });
        
        // Show the modal
        modal.style.display = 'block';
    }
    
    addBattleLog(message) {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        this.battleLog.appendChild(logEntry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
    
    showBattleResult(winner) {
        const logEntry = document.createElement('p');
        logEntry.style.fontWeight = 'bold';
        logEntry.style.fontSize = '18px';
        logEntry.style.color = '#e53935';
        logEntry.textContent = `${winner} wins the battle!`;
        this.battleLog.appendChild(logEntry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
}




