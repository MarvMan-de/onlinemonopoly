import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import Board from './components/Board';
import Dashboard from './components/Dashboard';

function App() {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('game_state', (state) => setGameState(state));
    socket.on('error', (err) => alert(err));

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game_state');
      socket.off('error');
    };
  }, []);

  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!gameState.started) {
    return <Lobby gameState={gameState} socket={socket} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-8 py-3 bg-white dark:bg-slate-900 z-20">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <span className="material-symbols-outlined text-4xl">monetization_on</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">MONOPOLY <span className="text-primary">MODERN</span></h2>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-6 gap-6 justify-center items-start">
         <Board gameState={gameState} socket={socket} />
         <Dashboard gameState={gameState} socket={socket} />
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            {gameState.players.map(p => (
              <span key={p.id} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span> {p.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold uppercase text-slate-400">
              Recent: {gameState.log[gameState.log.length - 1] || 'Game started'}
            </p>
          </div>
      </footer>
    </div>
  );
}

export default App;