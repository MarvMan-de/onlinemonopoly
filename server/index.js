const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Game = require('./game');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const game = new Game();
const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#eab308', '#a855f7'];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('game_state', game.getState());

  socket.on('join_game', (name) => {
    if (game.started) {
      socket.emit('error', 'Game already started');
      return;
    }

    const color = PLAYER_COLORS[game.players.length % PLAYER_COLORS.length];
    const joined = game.addPlayer(socket.id, name || `Player ${game.players.length + 1}`, color);

    if (joined) {
      game.addLog(`${name || 'Player'} joined the game.`);
      io.emit('game_state', game.getState());
    } else {
      socket.emit('error', 'Lobby is full');
    }
  });

  socket.on('start_game', () => {
    if (game.start()) {
      io.emit('game_state', game.getState());
    }
  });

  socket.on('roll_dice', () => {
    if (!game.started) return;
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;
    if (game.turnState.hasRolled && !game.turnState.rolledDoubles) return;
    if (game.turnState.owesRent || game.turnState.needsCard) return;

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const isDouble = die1 === die2;
    game.turnState.lastDiceRoll = total;
    game.turnState.hasRolled = true;
    game.turnState.rolledDoubles = isDouble;

    game.addLog(`${player.name} rolled a ${die1} and a ${die2} (${total}).`);

    if (player.inJail) {
      if (isDouble) {
        player.inJail = false;
        player.jailTurns = 0;
        game.addLog(`${player.name} rolled doubles and got out of Jail.`);
      } else {
        player.jailTurns += 1;
        if (player.jailTurns >= 3) {
           player.balance -= 50;
           player.inJail = false;
           player.jailTurns = 0;
           game.addLog(`${player.name} paid €50 to get out of Jail after 3 turns.`);
        } else {
           game.addLog(`${player.name} did not roll doubles and stays in Jail.`);
           io.emit('dice_rolled', { die1, die2, total, player: player.id });
           game.nextTurn();
           io.emit('game_state', game.getState());
           return;
        }
      }
    } else {
      if (isDouble) {
        player.doublesCount += 1;
        if (player.doublesCount === 3) {
          game.addLog(`${player.name} rolled 3 doubles in a row.`);
          game.sendToJail(player);
          io.emit('dice_rolled', { die1, die2, total, player: player.id });
          game.nextTurn();
          io.emit('game_state', game.getState());
          return;
        }
      } else {
        player.doublesCount = 0;
      }
    }

    // Move player
    let newPosition = player.position + total;
    if (newPosition >= 40) {
      newPosition -= 40;
      player.balance += 200; // Passed GO
      game.addLog(`${player.name} passed GO and collected €200.`);
    }
    player.position = newPosition;

    const currentSpace = game.board[newPosition];
    game.addLog(`${player.name} landed on ${currentSpace.name}.`);

    if (currentSpace.type === 'tax') {
      player.balance -= currentSpace.amount;
      game.addLog(`${player.name} paid €${currentSpace.amount} in tax.`);
    } else if (currentSpace.id === 30) {
      // Go To Jail
      game.sendToJail(player);
      game.nextTurn(); // end turn if sent to jail directly
    } else if (currentSpace.type === 'chance' || currentSpace.type === 'chest') {
      game.turnState.needsCard = true;
    } else if (currentSpace.ownerId && currentSpace.ownerId !== player.id && !currentSpace.isMortgaged) {
      const owner = game.getPlayer(currentSpace.ownerId);
      let rent = 0;
      if (currentSpace.type === 'property') {
          rent = currentSpace.rent[currentSpace.houses];
          if (currentSpace.houses === 0 && game.hasMonopoly(owner.id, currentSpace.group)) {
            rent *= 2;
          }
      } else if (currentSpace.type === 'railroad') {
          const ownedRailroads = game.board.filter(s => s.type === 'railroad' && s.ownerId === owner.id).length;
          rent = currentSpace.rent[ownedRailroads - 1] || 25;
      } else if (currentSpace.type === 'utility') {
          const ownedUtilities = game.board.filter(s => s.type === 'utility' && s.ownerId === owner.id).length;
          const diceTotal = game.turnState.lastDiceRoll;
          rent = ownedUtilities === 2 ? diceTotal * 10 : diceTotal * 4;
      }
      if (rent > 0) {
          game.turnState.owesRent = true;
          game.turnState.rentOwedTo = owner.id;
          game.turnState.rentAmount = rent;
      }
    }

    io.emit('dice_rolled', { die1, die2, total, player: player.id });
    io.emit('game_state', game.getState());
  });

  socket.on('pay_jail_fine', () => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id || !player.inJail) return;

    if (player.balance >= 50) {
      player.balance -= 50;
      player.inJail = false;
      player.jailTurns = 0;
      game.addLog(`${player.name} paid €50 to get out of Jail.`);
      io.emit('game_state', game.getState());
    }
  });

  socket.on('draw_card', () => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;
    if (!game.turnState.needsCard) return;

    const space = game.board[player.position];
    let card = null;

    if (space.type === 'chance') {
      card = game.drawChance();
    } else if (space.type === 'chest') {
      card = game.drawChest();
    }

    if (card) {
      game.addLog(`${player.name} drew: ${card.text}`);

      game.turnState.needsCard = false; // Reset needsCard since card is drawn

      if (card.action === 'collect') {
        player.balance += card.amount;
      } else if (card.action === 'pay') {
        player.balance -= card.amount;
      } else if (card.action === 'collect_all') {
        game.players.forEach(p => {
            if (p.id !== player.id) {
                p.balance -= card.amount;
                player.balance += card.amount;
            }
        });
      } else if (card.action === 'pay_all') {
        game.players.forEach(p => {
            if (p.id !== player.id) {
                p.balance += card.amount;
                player.balance -= card.amount;
            }
        });
      } else if (card.action === 'advance') {
        if (card.target < player.position) {
            player.balance += 200; // Passed Go
            game.addLog(`${player.name} passed GO and collected €200.`);
        }
        player.position = card.target;
      } else if (card.action === 'move') {
        player.position += card.amount;
        if (player.position < 0) player.position += 40;
      } else if (card.action === 'jail') {
        game.sendToJail(player);
        game.nextTurn();
        io.emit('card_drawn', { card, player: player.id });
        io.emit('game_state', game.getState());
        return;
      }

      // If moved to a property, check for rent, taxes, or other cards
      if (card.action === 'advance' || card.action === 'move') {
          const newSpace = game.board[player.position];
          game.addLog(`${player.name} landed on ${newSpace.name}.`);
          if (newSpace.type === 'tax') {
            player.balance -= newSpace.amount;
            game.addLog(`${player.name} paid €${newSpace.amount} in tax.`);
          } else if (newSpace.id === 30) {
            game.sendToJail(player);
            game.nextTurn();
            io.emit('card_drawn', { card, player: player.id });
            io.emit('game_state', game.getState());
            return;
          } else if (newSpace.type === 'chance' || newSpace.type === 'chest') {
            game.turnState.needsCard = true;
          } else if (newSpace.ownerId && newSpace.ownerId !== player.id && !newSpace.isMortgaged) {
              const owner = game.getPlayer(newSpace.ownerId);
              let rent = 0;
              if (newSpace.type === 'property') {
                  rent = newSpace.rent[newSpace.houses];
                  if (newSpace.houses === 0 && game.hasMonopoly(owner.id, newSpace.group)) rent *= 2;
              } else if (newSpace.type === 'railroad') {
                  const ownedRailroads = game.board.filter(s => s.type === 'railroad' && s.ownerId === owner.id).length;
                  rent = newSpace.rent[ownedRailroads - 1] || 25;
              } else if (newSpace.type === 'utility') {
                  const ownedUtilities = game.board.filter(s => s.type === 'utility' && s.ownerId === owner.id).length;
                  const diceTotal = game.turnState.lastDiceRoll || 7;
                  rent = ownedUtilities === 2 ? diceTotal * 10 : diceTotal * 4;
              }
              if (rent > 0) {
                  game.turnState.owesRent = true;
                  game.turnState.rentOwedTo = owner.id;
                  game.turnState.rentAmount = rent;
              }
          }
      }

      io.emit('card_drawn', { card, player: player.id });
      io.emit('game_state', game.getState());
    }
  });

  socket.on('buy_property', () => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;

    const space = game.board[player.position];
    if ((space.type === 'property' || space.type === 'railroad' || space.type === 'utility') && !space.ownerId && player.balance >= space.price) {
      player.balance -= space.price;
      space.ownerId = player.id;
      player.properties.push(space.id);
      game.addLog(`${player.name} bought ${space.name} for €${space.price}.`);
      io.emit('game_state', game.getState());
    }
  });

  socket.on('pay_rent', () => {
     const player = game.getCurrentPlayer();
     if (player.id !== socket.id) return;
     if (!game.turnState.owesRent) return;

     const owner = game.getPlayer(game.turnState.rentOwedTo);
     const rent = game.turnState.rentAmount;

     if (owner) {
         player.balance -= rent;
         owner.balance += rent;
         game.turnState.owesRent = false;
         game.turnState.rentOwedTo = null;
         game.turnState.rentAmount = 0;
         game.addLog(`${player.name} paid €${rent} rent to ${owner.name}.`);

         // In case they paid rent after rolling doubles
         if (game.turnState.rolledDoubles) {
           game.turnState.hasRolled = false;
         }
         io.emit('game_state', game.getState());
     }
  });

  socket.on('toggle_mortgage', (propertyId) => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;

    const space = game.board.find(s => s.id === propertyId);
    if (!space || space.ownerId !== player.id) return;
    if (space.houses > 0) return; // Must sell houses first

    if (space.isMortgaged) {
      const unmortgageCost = Math.floor(space.price / 2 * 1.1);
      if (player.balance >= unmortgageCost) {
        player.balance -= unmortgageCost;
        space.isMortgaged = false;
        game.addLog(`${player.name} unmortgaged ${space.name} for €${unmortgageCost}.`);
        io.emit('game_state', game.getState());
      }
    } else {
      const mortgageValue = space.price / 2;
      player.balance += mortgageValue;
      space.isMortgaged = true;
      game.addLog(`${player.name} mortgaged ${space.name} for €${mortgageValue}.`);
      io.emit('game_state', game.getState());
    }
  });

  socket.on('build_house', (propertyId) => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;

    const space = game.board.find(s => s.id === propertyId);
    if (!space || space.ownerId !== player.id || space.type !== 'property') return;
    if (!game.hasMonopoly(player.id, space.group)) return; // Needs monopoly

    // Check if evenly building (simplified: just checking if < 5 for now)
    if (space.houses < 5 && player.balance >= space.houseCost) {
      player.balance -= space.houseCost;
      space.houses += 1;
      const structure = space.houses === 5 ? 'hotel' : 'house';
      game.addLog(`${player.name} built a ${structure} on ${space.name}.`);
      io.emit('game_state', game.getState());
    }
  });

  socket.on('sell_house', (propertyId) => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;

    const space = game.board.find(s => s.id === propertyId);
    if (!space || space.ownerId !== player.id || space.type !== 'property') return;

    if (space.houses > 0) {
      space.houses -= 1;
      const value = space.houseCost / 2;
      player.balance += value;
      game.addLog(`${player.name} sold a building on ${space.name} for €${value}.`);
      io.emit('game_state', game.getState());
    }
  });

  socket.on('propose_trade', (toId, offer, request) => {
    const player = game.getPlayer(socket.id);
    const targetPlayer = game.getPlayer(toId);
    if (!player || !targetPlayer) return;

    // validation
    if (offer.cash > player.balance || request.cash > targetPlayer.balance) return;

    // check if properties have houses (cannot trade properties with houses)
    const hasHouses = (propIds) => propIds.some(id => game.board.find(s => s.id === id).houses > 0);
    if (hasHouses(offer.properties) || hasHouses(request.properties)) return;

    game.createTrade(socket.id, toId, offer, request);
    game.addLog(`${player.name} proposed a trade to ${targetPlayer.name}.`);
    io.emit('game_state', game.getState());
  });

  socket.on('accept_trade', (tradeId) => {
    const trade = game.pendingTrades.find(t => t.id === tradeId);
    if (!trade || trade.toId !== socket.id) return;

    const fromPlayer = game.getPlayer(trade.fromId);
    const toPlayer = game.getPlayer(trade.toId);

    if (fromPlayer && toPlayer) {
      // Execute trade
      fromPlayer.balance += trade.request.cash - trade.offer.cash;
      toPlayer.balance += trade.offer.cash - trade.request.cash;

      trade.offer.properties.forEach(propId => {
        fromPlayer.properties = fromPlayer.properties.filter(id => id !== propId);
        toPlayer.properties.push(propId);
        game.board.find(s => s.id === propId).ownerId = toPlayer.id;
      });

      trade.request.properties.forEach(propId => {
        toPlayer.properties = toPlayer.properties.filter(id => id !== propId);
        fromPlayer.properties.push(propId);
        game.board.find(s => s.id === propId).ownerId = fromPlayer.id;
      });

      game.addLog(`${toPlayer.name} accepted ${fromPlayer.name}'s trade.`);
    }

    game.removeTrade(tradeId);
    io.emit('game_state', game.getState());
  });

  socket.on('reject_trade', (tradeId) => {
    const trade = game.pendingTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const toPlayer = game.getPlayer(trade.toId);
    const fromPlayer = game.getPlayer(trade.fromId);
    if (toPlayer && fromPlayer) {
      game.addLog(`${toPlayer.name} rejected ${fromPlayer.name}'s trade.`);
    }

    game.removeTrade(tradeId);
    io.emit('game_state', game.getState());
  });

  socket.on('end_turn', () => {
    const player = game.getCurrentPlayer();
    if (player.id !== socket.id) return;
    if (!game.turnState.hasRolled) return;
    if (game.turnState.owesRent) return;
    if (game.turnState.needsCard) return;

    if (player.balance < 0) {
       // Player is bankrupt and cannot pay
       game.processBankruptcy(player.id, game.turnState.rentOwedTo); // Pass who they owed rent to, if anyone
       // Also if they owed rent and went bankrupt, clear the debt state
       game.turnState.owesRent = false;
       game.turnState.rentOwedTo = null;
    } else {
       game.addLog(`${player.name} ended their turn.`);
    }

    // if game is over (1 player left), we could handle it here
    if (game.players.length === 1 && game.started) {
        game.addLog(`${game.players[0].name} wins the game!`);
        game.started = false;
    }

    game.nextTurn();
    io.emit('game_state', game.getState());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const p = game.getPlayer(socket.id);
    if(p) {
        game.addLog(`${p.name} disconnected.`);
        game.removePlayer(socket.id);
        io.emit('game_state', game.getState());
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});