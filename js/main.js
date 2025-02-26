document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    const uiElements = {
        // Team Setup
        pokemonList: document.getElementById('pokemon-list'),
        selectedTeam: document.getElementById('selected-team'),
        selectedCount: document.getElementById('selected-count'),
        startGameBtn: document.getElementById('start-game'),
        teamSetup: document.getElementById('team-setup'),

        // Battle Phase
        battlePhase: document.getElementById('battle-phase'),
        playerName: document.getElementById('player-name'),
        playerImg: document.getElementById('player-img'),
        playerHealth: document.getElementById('player-health'),
        playerHPText: document.getElementById('player-hp-text'),
        playerMoves: document.getElementById('player-moves'),
        playerTeam: document.getElementById('player-team'),

        opponentName: document.getElementById('opponent-name'),
        opponentImg: document.getElementById('opponent-img'),
        opponentHealth: document.getElementById('opponent-health'),
        opponentHPText: document.getElementById('opponent-hp-text'),
        opponentTeam: document.getElementById('opponent-team'),

        battleLog: document.getElementById('battle-log'),
        battleStatus: document.getElementById('battle-status'),
        restartBtn: document.getElementById('restart-btn'),
        switchButton: document.getElementById('switch-pokemon'),

        // Switch Modal
        switchModal: document.getElementById('switch-modal'),
        switchOptions: document.getElementById('switch-options'),
        closeModal: document.getElementById('close-modal')
    };

    // Initialize classes
    const battleMechanics = new BattleMechanics(typeEffectiveness);
    const uiManager = new UIManager(uiElements);
    const gameController = new GameController(pokemonData, battleMechanics, uiManager);

    // Set up event listeners
    uiElements.startGameBtn.addEventListener('click', () => {
        gameController.startBattle();
    });

    uiElements.restartBtn.addEventListener('click', () => {
        gameController.resetGame();
    });

    uiElements.switchButton.addEventListener('click', () => {
        if (gameController.isPlayerTurn && gameController.battleInProgress) {
            gameController.promptPlayerSwitch();
        }
    });

    uiElements.closeModal.addEventListener('click', () => {
        uiManager.hideSwitchModal();
        gameController.isSwitching = false;
    });

    // Initialize team selection
    gameController.initTeamSelection();

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === uiElements.switchModal) {
            uiManager.hideSwitchModal();
            gameController.isSwitching = false;
        }
    });
});