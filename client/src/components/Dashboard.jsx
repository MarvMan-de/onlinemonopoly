import React, { useState, useEffect } from 'react';
import DiceTray from './DiceTray';
import TradeModal from './TradeModal';

const Dashboard = ({ gameState, socket }) => {
  const [lastDice, setLastDice] = useState({ d1: 1, d2: 1 });
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  useEffect(() => {
    socket.on('dice_rolled', (data) => {
      setLastDice({ d1: data.die1, d2: data.die2 });
    });
    return () => socket.off('dice_rolled');
  }, [socket]);

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const myPlayer = gameState.players.find(p => p.id === socket.id);
  const isMyTurn = activePlayer?.id === socket.id;

  const handleRollDice = () => {
    if (isMyTurn) {
      socket.emit('roll_dice');
    }
  };

  const handleBuy = () => {
    if (isMyTurn) {
      socket.emit('buy_property');
    }
  };

  const handlePayRent = () => {
    if (isMyTurn) {
      socket.emit('pay_rent');
    }
  };

  const handleEndTurn = () => {
    if (isMyTurn) {
      socket.emit('end_turn');
    }
  };

  const handlePayJail = () => {
    if (isMyTurn && myPlayer.inJail) {
      socket.emit('pay_jail_fine');
    }
  };

  const handleToggleMortgage = (id) => {
    if (isMyTurn) socket.emit('toggle_mortgage', id);
  };

  const handleBuild = (id) => {
    if (isMyTurn) socket.emit('build_house', id);
  };

  const handleSellHouse = (id) => {
    if (isMyTurn) socket.emit('sell_house', id);
  };

  const pendingTradesForMe = gameState.pendingTrades?.filter(t => t.toId === socket.id) || [];

  // Guard values based on turn state
  const turnState = gameState.turnState || {};
  const canRoll = isMyTurn && (!turnState.hasRolled || turnState.rolledDoubles);
  const canEndTurn = isMyTurn && turnState.hasRolled && (!turnState.owesRent || activePlayer.balance < 0) && !turnState.needsCard;

  return (
    <aside className="w-80 flex flex-col gap-6">
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        gameState={gameState}
        socket={socket}
      />

      {/* Trade Requests Alert */}
      {pendingTradesForMe.length > 0 && (
        <div className="bg-blue-100 border border-blue-200 p-4 rounded-xl shadow-lg">
          <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">handshake</span> Trade Offer Received!
          </h4>
          <p className="text-xs text-blue-700 mb-3">{gameState.players.find(p => p.id === pendingTradesForMe[0].fromId)?.name} wants to trade.</p>
          <div className="flex gap-2">
            <button
              onClick={() => socket.emit('accept_trade', pendingTradesForMe[0].id)}
              className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded shadow hover:bg-blue-700"
            >
              Accept
            </button>
            <button
              onClick={() => socket.emit('reject_trade', pendingTradesForMe[0].id)}
              className="flex-1 bg-white text-blue-800 text-xs font-bold py-2 rounded shadow border border-blue-200 hover:bg-slate-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
      {/* Cash Dashboard */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Player</p>
          <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: activePlayer?.color }}></span>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: activePlayer?.color }}>
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{activePlayer?.name}</h3>
            <p className="text-xs text-slate-500">{isMyTurn ? '(You)' : 'Opponent'}</p>
          </div>
        </div>
        <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between border border-primary/20">
          <span className="text-sm font-medium">Cash Balance</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">€{activePlayer?.balance}</span>
        </div>
      </div>

      {/* Property Inventory */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg flex-1 flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden max-h-64">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h4 className="font-bold text-sm">Portfolio</h4>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] font-bold">
            {activePlayer?.properties.length} PROPERTIES
          </span>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-2">
          {activePlayer?.properties.map(propId => {
            const space = gameState.board.find(s => s.id === propId);
            const isProperty = space.type === 'property';
            const ownsMonopoly = isProperty && gameState.board.filter(s => s.group === space.group).every(s => s.ownerId === activePlayer.id);
            const canBuild = ownsMonopoly && !space.isMortgaged && space.houses < 5;
            const canSellHouse = ownsMonopoly && space.houses > 0;

            return (
              <div key={propId} className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 ${space.isMortgaged ? 'opacity-50 grayscale' : ''}`}>
                <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: space.color || '#cbd5e1' }}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold leading-tight uppercase truncate">{space.name} {space.houses > 0 ? `(${space.houses === 5 ? 'Hotel' : space.houses + ' Houses'})` : ''}</p>
                  <p className="text-[9px] text-slate-500">
                    {space.isMortgaged ? 'Mortgaged' : `Rent: €${space.rent?.[space.houses] || space.price/10}`}
                  </p>
                </div>
                {isMyTurn && (
                  <div className="flex flex-col gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleToggleMortgage(propId)} className="text-[8px] font-bold bg-slate-200 px-1 py-0.5 rounded text-slate-600 hover:bg-slate-300">
                      {space.isMortgaged ? 'Unmortgage' : 'Mortgage'}
                    </button>
                    {canBuild && (
                      <button onClick={() => handleBuild(propId)} className="text-[8px] font-bold bg-green-200 px-1 py-0.5 rounded text-green-700 hover:bg-green-300">
                        Build (€{space.houseCost})
                      </button>
                    )}
                    {canSellHouse && (
                      <button onClick={() => handleSellHouse(propId)} className="text-[8px] font-bold bg-red-200 px-1 py-0.5 rounded text-red-700 hover:bg-red-300">
                        Sell House (€{space.houseCost / 2})
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {activePlayer?.properties.length === 0 && (
            <p className="text-xs text-center text-slate-400 mt-4">No properties owned</p>
          )}
        </div>
      </div>

      {/* Actions / Dice Tray */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
        <DiceTray
          dice1={lastDice.d1}
          dice2={lastDice.d2}
          onRoll={handleRollDice}
          disabled={!canRoll}
        />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleBuy} disabled={!isMyTurn} className="text-xs font-bold bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 disabled:opacity-50">Buy</button>
          <button onClick={handlePayRent} disabled={!isMyTurn || !turnState.owesRent} className="text-xs font-bold bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 disabled:opacity-50 relative">
            Pay Rent
            {isMyTurn && turnState.owesRent && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
          </button>
          <button onClick={() => isMyTurn && socket.emit('draw_card')} disabled={!isMyTurn || !turnState.needsCard} className="text-xs font-bold bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 disabled:opacity-50 relative">
            Draw Card
            {isMyTurn && turnState.needsCard && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
          </button>
          <button onClick={handlePayJail} disabled={!isMyTurn || !myPlayer?.inJail} className="text-xs font-bold bg-orange-100 text-orange-700 p-2 rounded hover:bg-orange-200 disabled:opacity-50">Pay €50 (Jail)</button>
          <button onClick={() => setIsTradeModalOpen(true)} disabled={!isMyTurn} className="text-xs font-bold bg-purple-100 text-purple-700 p-2 rounded hover:bg-purple-200 disabled:opacity-50 col-span-2">Propose Trade</button>
          <button onClick={handleEndTurn} disabled={!canEndTurn} className="text-xs font-bold bg-slate-100 text-slate-700 p-2 rounded hover:bg-slate-200 disabled:opacity-50 col-span-2">{activePlayer?.balance < 0 ? 'Declare Bankruptcy' : 'End Turn'}</button>
        </div>
      </div>
    </aside>
  );
};

export default Dashboard;