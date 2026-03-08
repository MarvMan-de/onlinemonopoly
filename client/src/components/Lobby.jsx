import React, { useState } from 'react';

function Lobby({ gameState, socket }) {
  const [name, setName] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    socket.emit('join_game', name);
  };

  const handleStart = () => {
    socket.emit('start_game');
  };

  const isHost = gameState.players.length > 0 && gameState.players[0].id === socket.id;
  const isJoined = gameState.players.find(p => p.id === socket.id);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-display">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 text-slate-800">
          Monopoly <span className="text-primary">Modern</span>
        </h1>

        {!isJoined ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Enter Username</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Player Name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 rounded-lg shadow transition-all active:scale-[0.98]"
            >
              Join Game
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Players in Lobby ({gameState.players.length}/4)</h3>
              <ul className="space-y-2">
                {gameState.players.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span className="font-medium text-slate-700">{p.name} {p.id === socket.id && '(You)'}</span>
                    {i === 0 && <span className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">HOST</span>}
                  </li>
                ))}
              </ul>
            </div>

            {isHost && gameState.players.length >= 2 && (
              <button
                onClick={handleStart}
                className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 rounded-lg shadow transition-all active:scale-[0.98]"
              >
                Start Game
              </button>
            )}

            {!isHost && gameState.players.length >= 2 && (
              <p className="text-center text-sm text-slate-500 font-medium animate-pulse">
                Waiting for host to start...
              </p>
            )}

            {gameState.players.length < 2 && (
              <p className="text-center text-sm text-slate-500 font-medium">
                Waiting for more players...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;