import React, { useState } from 'react';

const TradeModal = ({ gameState, socket, isOpen, onClose }) => {
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [offerCash, setOfferCash] = useState(0);
  const [requestCash, setRequestCash] = useState(0);
  const [offerProps, setOfferProps] = useState([]);
  const [requestProps, setRequestProps] = useState([]);

  if (!isOpen) return null;

  const myPlayer = gameState.players.find(p => p.id === socket.id);
  const opponents = gameState.players.filter(p => p.id !== socket.id);
  const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);

  const toggleProp = (propId, list, setList) => {
    if (list.includes(propId)) {
      setList(list.filter(id => id !== propId));
    } else {
      setList([...list, propId]);
    }
  };

  const handlePropose = () => {
    if (!targetPlayerId) return;
    socket.emit('propose_trade', targetPlayerId, {
      cash: parseInt(offerCash) || 0,
      properties: offerProps
    }, {
      cash: parseInt(requestCash) || 0,
      properties: requestProps
    });
    onClose();
    // Reset state
    setTargetPlayerId('');
    setOfferCash(0);
    setRequestCash(0);
    setOfferProps([]);
    setRequestProps([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-display">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Propose Trade</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-600 mb-2">Trade With</label>
          <select
            className="w-full p-3 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700"
            value={targetPlayerId}
            onChange={(e) => setTargetPlayerId(e.target.value)}
          >
            <option value="">Select an opponent...</option>
            {opponents.map(p => (
              <option key={p.id} value={p.id}>{p.name} (€{p.balance})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* My Offer */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Your Offer</h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">Cash (Max €{myPlayer.balance})</label>
              <input
                type="number"
                min="0"
                max={myPlayer.balance}
                value={offerCash}
                onChange={e => setOfferCash(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Properties</label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {myPlayer.properties.length === 0 && <span className="text-xs text-slate-400">No properties</span>}
                {myPlayer.properties.map(id => {
                  const space = gameState.board.find(s => s.id === id);
                  if (space.houses > 0) return null; // Cannot trade properties with houses
                  return (
                    <label key={id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={offerProps.includes(id)} onChange={() => toggleProp(id, offerProps, setOfferProps)} />
                      <span>{space.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Their Offer */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">You Request</h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">Cash {targetPlayer ? `(Max €${targetPlayer.balance})` : ''}</label>
              <input
                type="number"
                min="0"
                max={targetPlayer?.balance || 0}
                disabled={!targetPlayer}
                value={requestCash}
                onChange={e => setRequestCash(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Properties</label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {!targetPlayer && <span className="text-xs text-slate-400">Select a player</span>}
                {targetPlayer && targetPlayer.properties.length === 0 && <span className="text-xs text-slate-400">No properties</span>}
                {targetPlayer && targetPlayer.properties.map(id => {
                  const space = gameState.board.find(s => s.id === id);
                  if (space.houses > 0) return null;
                  return (
                    <label key={id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={requestProps.includes(id)} onChange={() => toggleProp(id, requestProps, setRequestProps)} />
                      <span>{space.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePropose}
          disabled={!targetPlayerId}
          className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 rounded-lg shadow disabled:opacity-50 transition-all"
        >
          Send Trade Proposal
        </button>
      </div>
    </div>
  );
};

export default TradeModal;