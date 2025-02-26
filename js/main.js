const gameController = new GameController();
const uiManager = new UIManager();

// Make it available globally for the LLMBattleController
window.gameController = gameController;
window.uiManager = uiManager;