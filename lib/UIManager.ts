export class UIManager {
  constructor() {
    // Initialize any UI-related state
  }
  
  setPlayerNames(player1Name: string, player2Name: string) {
    // This will be overridden in React components
  }
  
  addBattleLog(message: string) {
    // This will be overridden in React components
  }
  
  showSwitchOptions(player: string, team: any[], activeIndex: number) {
    // This will be overridden in React components
  }
  
  updatePokemonDisplay(player: string, pokemon: any) {
    // This will be overridden in React components
  }
  
  showBattleResult(winner: string) {
    this.addBattleLog(`${winner} wins the battle!`);
  }
}