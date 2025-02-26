class LLMBattleController {
    constructor(gameController, uiManager) {
        this.gameController = gameController;
        this.uiManager = uiManager;
        this.autoBattleInterval = null;
        this.isAutoBattling = false;
        this.moveDelay = 2000; // Default delay between moves in ms
        
        // LLM configurations
        this.llm1 = {
            model: "claude",
            name: "ClaudeBot"
        };
        
        this.llm2 = {
            model: "random",
            name: "RandomBot"
        };
    }
    
    setLLMConfigs() {
        this.llm1.model = document.getElementById('llm1-model').value;
        this.llm1.name = document.getElementById('llm1-name').value || "LLM 1";
        
        this.llm2.model = document.getElementById('llm2-model').value;
        this.llm2.name = document.getElementById('llm2-name').value || "LLM 2";
        
        this.moveDelay = parseInt(document.getElementById('move-delay').value) || 2000;
        
        // Update UI with LLM names
        this.uiManager.setPlayerNames(this.llm1.name, this.llm2.name);
    }
    
    startBattle() {
        this.setLLMConfigs();
        
        // Auto-select teams for both LLMs
        this.selectRandomTeams();
        
        // Show battle UI
        this.uiManager.showBattlePhase();
        
        // Initialize battle
        this.gameController.startBattle();
        
        // Update thinking displays
        document.getElementById('llm1-thinking').innerHTML = `<h3>${this.llm1.name} Thinking</h3><p>Analyzing battle state...</p>`;
        document.getElementById('llm2-thinking').innerHTML = `<h3>${this.llm2.name} Thinking</h3><p>Waiting for turn...</p>`;
    }
    
    selectRandomTeams() {
        // Get all Pokemon keys
        const pokemonKeys = Object.keys(this.gameController.pokemonData);
        
        // Select random teams
        const selectRandomTeam = () => {
            const teamKeys = new Set();
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
        const thinkingElement = document.getElementById(`${currentPlayer}-thinking`);
        thinkingElement.innerHTML = `<h3>${llm.name} Thinking</h3><p>Analyzing battle state and choosing next move...</p>`;
        
        // Get battle state for decision making
        const battleState = this.getBattleState();
        
        // Determine if we need to switch Pokemon (forced after fainting)
        if (this.gameController.forcedSwitch) {
            // Simulate LLM thinking
            setTimeout(() => {
                const switchDecision = this.getLLMSwitchDecision(llm, battleState);
                
                // Update thinking display with decision
                thinkingElement.innerHTML = `<h3>${llm.name} Thinking</h3><p>${switchDecision.reasoning}</p>`;
                
                // Execute the switch
                setTimeout(() => {
                    this.gameController.switchPlayerPokemon(currentPlayer, switchDecision.index);
                    
                    // If auto battling, continue
                    if (this.isAutoBattling) {
                        setTimeout(() => this.executeNextMove(), this.moveDelay);
                    }
                }, 1000);
            }, 1000);
            
            return;
        }
        
        // Get LLM decision
        setTimeout(() => {
            const decision = this.getLLMDecision(llm, battleState);
            
            // Update thinking display
            thinkingElement.innerHTML = `<h3>${llm.name} Thinking</h3><p>${decision.reasoning}</p>`;
            
            // Execute the decision
            setTimeout(() => {
                if (decision.action === 'move') {
                    // Find the move button and trigger a click
                    const movesContainer = document.getElementById(`${currentPlayer}-moves`);
                    const moveButtons = movesContainer.querySelectorAll('.move-btn');
                    const moveToUse = Array.from(moveButtons).find(btn => btn.textContent === decision.moveName);
                    
                    if (moveToUse) {
                        moveToUse.click();
                    } else {
                        // Fallback to random move if not found
                        moveButtons[Math.floor(Math.random() * moveButtons.length)].click();
                    }
                } else if (decision.action === 'switch') {
                    // Trigger switch Pokemon
                    document.getElementById(`${currentPlayer}-switch`).click();
                    
                    // Wait for modal and select Pokemon
                    setTimeout(() => {
                        const switchOptions = document.querySelectorAll('.switch-option');
                        if (switchOptions.length > 0) {
                            // Either select specific Pokemon or random one
                            const optionToClick = decision.specificIndex !== undefined && 
                                                    decision.specificIndex < switchOptions.length ? 
                                                    switchOptions[decision.specificIndex] : 
                                                    switchOptions[Math.floor(Math.random() * switchOptions.length)];
                            
                            optionToClick.click();
                        }
                    }, 500);
                }
                
                // If auto battling, continue
                if (this.isAutoBattling) {
                    setTimeout(() => this.executeNextMove(), this.moveDelay);
                }
            }, 1000);
        }, 1000);
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
    
    getLLMDecision(llm, battleState) {
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
        
        // For other LLM models, implement a basic strategy (simulating LLM decisions)
        // In a real implementation, this would make an API call to the LLM
        
        // Check if current Pokemon is at low health
        const lowHealth = activePokemon.currentHP < activePokemon.maxHP * 0.3;
        
        // Check for super effective moves
        const typeEffectiveness = this.gameController.battleMechanics.typeEffectiveness;
        let bestMove = null;
        let bestDamage = 0;
        
        for (const move of activePokemon.moves) {
            const effectiveness = typeEffectiveness[move.type] && 
                                    typeEffectiveness[move.type][opponentPokemon.type] || 1;
            const potential = move.power * effectiveness;
            
            if (potential > bestDamage) {
                bestDamage = potential;
                bestMove = move;
            }
        }
        
        // Decision logic
        if (lowHealth && Math.random() < 0.8) { // 80% chance to switch when at low health
            return {
                action: 'switch',
                reasoning: `${activePokemon.name} is low on health (${activePokemon.currentHP}/${activePokemon.maxHP}). Strategic decision to switch to a healthier Pokemon.`,
                specificIndex: undefined
            };
        } else if (bestMove && bestDamage > bestMove.power) { // We found a super effective move
            return {
                action: 'move',
                moveName: bestMove.name,
                reasoning: `Selected ${bestMove.name} because it's super effective against ${opponentPokemon.name}'s ${opponentPokemon.type} type.`
            };
        } else { // Use best available move
            const movesByPower = [...activePokemon.moves].sort((a, b) => b.power - a.power);
            const chosenMove = movesByPower[0];
            
            return {
                action: 'move',
                moveName: chosenMove.name,
                reasoning: `Selected ${chosenMove.name} as it has the highest base power (${chosenMove.power}) among available moves.`
            };
        }
    }
    
    getLLMSwitchDecision(llm, battleState) {
        const isPlayer1 = battleState.currentTurn === 'player1';
        const team = isPlayer1 ? battleState.player1.team : battleState.player2.team;
        const opponent = isPlayer1 ? battleState.player2.activePokemon : battleState.player1.activePokemon;
        
        // Find available Pokemon
        const availablePokemon = team.filter(p => p.currentHP > 0);
        
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
            const teamIndex = team.findIndex(p => p.name === chosenPokemon.name);
            
            return {
                index: teamIndex,
                reasoning: `Randomly selected ${chosenPokemon.name} as the next Pokemon.`
            };
        }
        
        // For other models, implement basic strategy
        // Sort by HP first for simplicity
        const sortedByHP = [...availablePokemon].sort((a, b) => b.currentHP - a.currentHP);
        const chosenPokemon = sortedByHP[0];
        
        // Find the index in the original team
        const teamIndex = team.findIndex(p => p.name === chosenPokemon.name);
        
        return {
            index: teamIndex,
            reasoning: `Selected ${chosenPokemon.name} as it has the highest remaining HP (${chosenPokemon.currentHP}/${chosenPokemon.maxHP}) among available Pokemon.`
        };
    }
    
    toggleAutoBattle() {
        if (this.isAutoBattling) {
            // Stop auto battle
            this.isAutoBattling = false;
            document.getElementById('toggle-auto-battle').textContent = "Start Auto Battle";
        } else {
            // Start auto battle
            this.isAutoBattling = true;
            document.getElementById('toggle-auto-battle').textContent = "Stop Auto Battle";
            this.executeNextMove();
        }
    }
    
    restartBattle() {
        // Stop auto battle if running
        this.isAutoBattling = false;
        document.getElementById('toggle-auto-battle').textContent = "Start Auto Battle";
        
        // Reset the game
        this.gameController.resetGame();
        
        // Show LLM settings
        document.getElementById('llm-settings').style.display = 'block';
        document.getElementById('battle-phase').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements, battle mechanics, etc. as in the original code
    
    // Initialize LLM Battle Controller
    const llmBattleController = new LLMBattleController(gameController, uiManager);
    
    // Set up event listeners for LLM battle UI
    document.getElementById('start-llm-battle').addEventListener('click', () => {
        document.getElementById('llm-settings').style.display = 'none';
        llmBattleController.startBattle();
    });
    
    document.getElementById('next-move').addEventListener('click', () => {
        llmBattleController.executeNextMove();
    });
    
    document.getElementById('toggle-auto-battle').addEventListener('click', () => {
        llmBattleController.toggleAutoBattle();
    });
    
    document.getElementById('restart-battle').addEventListener('click', () => {
        llmBattleController.restartBattle();
    });
});
