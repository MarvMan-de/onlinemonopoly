// server/game.js
const { BOARD_SPACES, CHANCE_CARDS, CHEST_CARDS, shuffle } = require('./data');

class Game {
  constructor() {
    this.players = [];
    this.chanceDeck = shuffle([...CHANCE_CARDS]);
    this.chestDeck = shuffle([...CHEST_CARDS]);
    this.started = false;
    this.currentTurnIndex = 0;
    this.board = BOARD_SPACES.map(space => ({
      ...space,
      ownerId: null,
      houses: 0,
      hotel: false,
      isMortgaged: false
    }));
    this.log = [];
    this.pendingTrades = []; // list of { id, fromId, toId, offer: {cash, properties}, request: {cash, properties} }
    this.turnState = {
      hasRolled: false,
      lastDiceRoll: 0,
      owesRent: false,
      rentOwedTo: null,
      rentAmount: 0,
      needsCard: false,
      rolledDoubles: false
    };
  }

  addPlayer(id, name, color) {
    if (this.players.length >= 4) return false;
    this.players.push({
      id,
      name,
      color,
      balance: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      doublesCount: 0,
      properties: [] // array of property ids
    });
    return true;
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
  }

  processBankruptcy(playerId, owedToId = null) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    // Reset all their properties
    this.board.forEach(space => {
      if (space.ownerId === player.id) {
        if (owedToId) {
          space.ownerId = owedToId;
        } else {
          space.ownerId = null;
          space.houses = 0;
          space.hotel = false;
          space.isMortgaged = false;
        }
      }
    });

    if (owedToId) {
       const owedTo = this.getPlayer(owedToId);
       if (owedTo) {
           owedTo.balance += Math.max(0, player.balance);
           owedTo.properties.push(...player.properties);
       }
    }

    this.addLog(`${player.name} went bankrupt and is eliminated.`);
    this.removePlayer(player.id);
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id);
  }

  start() {
    if (this.players.length >= 2) {
      this.started = true;
      this.currentTurnIndex = 0;
      this.addLog("Game started!");
      return true;
    }
    return false;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  nextTurn() {
    const player = this.getCurrentPlayer();
    if (player) player.doublesCount = 0; // reset on turn end
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    this.turnState = {
      hasRolled: false,
      lastDiceRoll: 0,
      owesRent: false,
      rentOwedTo: null,
      rentAmount: 0,
      needsCard: false,
      rolledDoubles: false
    };
  }

  sendToJail(player) {
    player.inJail = true;
    player.position = 10;
    player.jailTurns = 0;
    player.doublesCount = 0;
    this.addLog(`${player.name} was sent to Jail.`);
  }

  addLog(message) {
    this.log.push(message);
    if (this.log.length > 50) this.log.shift();
  }

  hasMonopoly(playerId, group) {
    const groupProperties = this.board.filter(s => s.group === group);
    return groupProperties.every(s => s.ownerId === playerId);
  }

  drawChance() {
    const card = this.chanceDeck.shift();
    this.chanceDeck.push(card);
    return card;
  }

  drawChest() {
    const card = this.chestDeck.shift();
    this.chestDeck.push(card);
    return card;
  }

  createTrade(fromId, toId, offer, request) {
    const trade = {
        id: Date.now().toString(),
        fromId,
        toId,
        offer,
        request
    };
    this.pendingTrades.push(trade);
    return trade;
  }

  removeTrade(tradeId) {
    this.pendingTrades = this.pendingTrades.filter(t => t.id !== tradeId);
  }

  getState() {
    return {
      players: this.players,
      board: this.board,
      currentTurnIndex: this.currentTurnIndex,
      started: this.started,
      log: this.log,
      pendingTrades: this.pendingTrades,
      turnState: this.turnState
    };
  }
}

module.exports = Game;