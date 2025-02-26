document.addEventListener('DOMContentLoaded', () => {
// Initialize UI elements
const uiElements = {
    // Player Name Input
    playerNames: document.getElementById('player-names'),
    player1NameInput: document.getElementById('player1-name-input'),
    player2NameInput: document.getElementById('player2-name-input'),
    confirmNamesBtn: document.getElementById('confirm-names'),

    // Team Setup - Player 1
    player1TeamSetup: document.getElementById('player1-team-setup'),
    player1PokemonList: document.getElementById('player1-pokemon-list'),
    player1SelectedTeam: document.getElementById('player1-selected-team'),
    player1SelectedCount: document.getElementById('player1-selected-count'),
    player1ConfirmTeam: document.getElementById('player1-confirm-team'),
    player1NameDisplay: document.getElementById('player1-name-display'),

    // Team Setup - Player 2
    player2TeamSetup: document.getElementById('player2-team-setup'),
    player2PokemonList: document.getElementById('player2-pokemon-list'),
    player2SelectedTeam: document.getElementById('player2-selected-team'),
    player2SelectedCount: document.getElementById('player2-selected-count'),
    player2ConfirmTeam: document.getElementById('player2-confirm-team'),
    player2NameDisplay: document.getElementById('player2-name-display'),

    // Battle Phase
    battlePhase: document.getElementById('battle-phase'),
    turnIndicator: document.getElementById('turn-indicator'),

    // Player 1 Battle UI
    player1Label: document.getElementById('player1-label'),
    player1PokemonName: document.getElementById('player1-pokemon-name'),
    player1Img: document.getElementById('player1-img'),
    player1Health: document.getElementById('player1-health'),
    player1HPText: document.getElementById('player1-hp-text'),
    player1Moves: document.getElementById('player1-moves'),
    player1Team: document.getElementById('player1-team'),
    player1Switch: document.getElementById('player1-switch'),

    // Player 2 Battle UI
    player2Label: document.getElementById('player2-label'),
    player2PokemonName: document.getElementById('player2-pokemon-name'),
    player2Img: document.getElementById('player2-img'),
    player2Health: document.getElementById('player2-health'),
    player2HPText: document.getElementById('player2-hp-text'),
    player2Moves: document.getElementById('player2-moves'),
    player2Team: document.getElementById('player2-team'),
    player2Switch: document.getElementById('player2-switch'),

    // Battle Info
    battleLog: document.getElementById('battle-log'),
    battleStatus: document.getElementById('battle-status'),
    restartBtn: document.getElementById('restart-btn'),

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
// Player name confirmation
uiElements.confirmNamesBtn.addEventListener('click', () => {
    gameController.setPlayerNames();
});

// Team confirmation
uiElements.player1ConfirmTeam.addEventListener('click', () => {
    gameController.confirmTeam('player1');
});

uiElements.player2ConfirmTeam.addEventListener('click', () => {
    gameController.confirmTeam('player2');
});

// Switch Pokemon buttons
uiElements.player1Switch.addEventListener('click', () => {
    gameController.promptPlayerSwitch('player1');
});

uiElements.player2Switch.addEventListener('click', () => {
    gameController.promptPlayerSwitch('player2');
});

// Restart button
uiElements.restartBtn.addEventListener('click', () => {
    gameController.resetGame();
});

// Close modal
uiElements.closeModal.addEventListener('click', () => {
    uiManager.hideSwitchModal();
    gameController.isSwitching = false;
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === uiElements.switchModal) {
        uiManager.hideSwitchModal();
        gameController.isSwitching = false;
    }
});
});
