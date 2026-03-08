const Game = require('./game');
const assert = require('assert');

function runTests() {
  console.log("Running backend logic tests...");

  const game = new Game();

  // Test adding players
  game.addPlayer('id1', 'Alice', 'blue');
  game.addPlayer('id2', 'Bob', 'red');

  assert.strictEqual(game.players.length, 2);
  assert.strictEqual(game.players[0].name, 'Alice');
  assert.strictEqual(game.players[1].name, 'Bob');

  // Test starting game
  const started = game.start();
  assert.strictEqual(started, true);
  assert.strictEqual(game.currentTurnIndex, 0);

  // Test getting current player
  const player = game.getCurrentPlayer();
  assert.strictEqual(player.id, 'id1');

  // Test Jail Logic helper
  game.sendToJail(player);
  assert.strictEqual(player.inJail, true);
  assert.strictEqual(player.position, 10);
  assert.strictEqual(player.jailTurns, 0);
  assert.strictEqual(player.doublesCount, 0);

  // Test next turn
  game.nextTurn();
  assert.strictEqual(game.currentTurnIndex, 1);
  const player2 = game.getCurrentPlayer();
  assert.strictEqual(player2.id, 'id2');

  // Test trading logic
  const trade = game.createTrade('id2', 'id1', {cash: 100, properties: []}, {cash: 0, properties: []});
  assert.strictEqual(game.pendingTrades.length, 1);
  assert.strictEqual(game.pendingTrades[0].id, trade.id);

  game.removeTrade(trade.id);
  assert.strictEqual(game.pendingTrades.length, 0);

  // Return to first player
  game.nextTurn();
  assert.strictEqual(game.currentTurnIndex, 0);

  // Test removing player
  game.removePlayer('id1');
  assert.strictEqual(game.players.length, 1);

  console.log("All tests passed successfully!");
}

runTests();