import React from 'react';

const COLOR_MAP = {
  'lila': 'bg-purple-600',
  'hellblau': 'bg-cyan-400',
  'pink': 'bg-pink-500',
  'orange': 'bg-orange-500',
  'rot': 'bg-red-600',
  'gelb': 'bg-yellow-400',
  'gruen': 'bg-green-600',
  'dunkelblau': 'bg-blue-800',
};

// Maps 0-39 to (col, row) on an 11x11 grid (1-indexed for CSS grid)
const getGridPosition = (index) => {
  if (index >= 0 && index <= 10) return { col: 11 - index, row: 11 }; // Bottom row (Right to Left)
  if (index >= 11 && index <= 19) return { col: 1, row: 11 - (index - 10) }; // Left col (Bottom to Top)
  if (index >= 20 && index <= 30) return { col: 1 + (index - 20), row: 1 }; // Top row (Left to Right)
  if (index >= 31 && index <= 39) return { col: 11, row: 1 + (index - 30) }; // Right col (Top to Bottom)
  return { col: 1, row: 1 };
};

const BoardSpace = ({ space, players }) => {
  const { col, row } = getGridPosition(space.id);
  const colorClass = space.group ? COLOR_MAP[space.group] : 'bg-slate-200';

  const isCorner = space.id % 10 === 0;
  const isTop = row === 1;
  const isBottom = row === 11;
  const isLeft = col === 1;
  const isRight = col === 11;

  let content = null;

  const spaceClasses = `bg-white flex flex-col items-center justify-between p-1 text-center relative z-10 overflow-hidden ${
    isCorner ? 'font-black bg-slate-50' : ''
  }`;

  if (isCorner) {
    if (space.id === 0) {
      content = (
        <div className="flex flex-col items-center justify-center w-full h-full text-primary bg-primary/10">
          <span className="text-[8px] font-black leading-tight">LOS €200</span>
          <span className="material-symbols-outlined text-4xl leading-none">arrow_forward</span>
          <span className="text-2xl font-black">GO</span>
        </div>
      );
    } else if (space.id === 10) {
      content = (
        <div className="flex flex-col items-center justify-center w-full h-full text-slate-800">
          <span className="material-symbols-outlined text-3xl">lock</span>
          <span className="text-[10px] uppercase">Gefängnis</span>
        </div>
      );
    } else if (space.id === 20) {
      content = (
        <div className="flex flex-col items-center justify-center w-full h-full text-red-500">
          <span className="material-symbols-outlined text-3xl">local_parking</span>
          <span className="text-[10px] uppercase">Frei Parken</span>
        </div>
      );
    } else if (space.id === 30) {
      content = (
        <div className="flex flex-col items-center justify-center w-full h-full text-orange-600">
          <span className="material-symbols-outlined text-3xl">gavel</span>
          <span className="text-[10px] uppercase">Gehe ins Gefängnis</span>
        </div>
      );
    }
  } else {
    // Non-corner spaces
    if (space.type === 'property') {
      if (isTop) {
        content = (
          <>
            <div className={`h-3 w-full mb-1 shrink-0 ${colorClass}`}></div>
            <span className="text-[7px] font-bold leading-tight uppercase flex-1 flex items-center text-center break-words max-w-full px-0.5">{space.name}</span>
            <span className="text-[8px] font-semibold text-slate-500 mt-auto shrink-0">€{space.price}</span>
          </>
        );
      } else if (isBottom) {
        content = (
          <>
            <div className={`h-3 w-full mb-1 shrink-0 ${colorClass}`}></div>
            <span className="text-[7px] font-bold leading-tight uppercase flex-1 flex items-center text-center">{space.name}</span>
            <span className="text-[8px] font-semibold text-slate-500 mt-auto shrink-0">€{space.price}</span>
          </>
        );
      } else if (isLeft) {
        content = (
          <div className="w-full h-full relative flex flex-row-reverse">
            <div className={`w-3 h-full shrink-0 ${colorClass}`}></div>
            <div className="flex-1 flex flex-row items-center justify-between py-1 px-0.5 w-full overflow-hidden"
                 style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <span className="text-[7px] font-bold leading-tight uppercase flex-1 flex items-center justify-center text-center max-h-full px-0.5">
                {space.name}
              </span>
              <span className="text-[8px] font-semibold text-slate-500 shrink-0">
                €{space.price}
              </span>
            </div>
          </div>
        );
      } else if (isRight) {
        content = (
          <div className="w-full h-full relative flex flex-row">
            <div className={`w-3 h-full shrink-0 ${colorClass}`}></div>
            <div className="flex-1 flex flex-row items-center justify-between py-1 px-0.5 w-full overflow-hidden"
                 style={{ writingMode: 'vertical-rl' }}>
              <span className="text-[7px] font-bold leading-tight uppercase flex-1 flex items-center justify-center text-center max-h-full px-0.5">
                {space.name}
              </span>
              <span className="text-[8px] font-semibold text-slate-500 shrink-0">
                €{space.price}
              </span>
            </div>
          </div>
        );
      }
    } else {
       // Chance, Chest, Tax, Railroad, Utility
       let icon = '';
       let iconColor = 'text-slate-600';
       if (space.type === 'chance') { icon = 'question_mark'; iconColor = 'text-orange-400'; }
       else if (space.type === 'chest') { icon = 'featured_play_list'; iconColor = 'text-blue-400'; }
       else if (space.type === 'railroad') { icon = 'train'; iconColor = 'text-slate-600'; }
       else if (space.type === 'utility' && space.id === 12) { icon = 'bolt'; iconColor = 'text-yellow-600'; }
       else if (space.type === 'utility' && space.id === 28) { icon = 'water_drop'; iconColor = 'text-blue-500'; }
       else if (space.type === 'tax') { icon = 'payments'; iconColor = 'text-slate-800'; }

       content = (
         <div className="w-full h-full relative">
           {(isLeft) && (
             <div
               className="absolute inset-0 flex flex-row items-center justify-center gap-1"
               style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
             >
               <span className={`material-symbols-outlined text-2xl ${iconColor} rotate-90`}>{icon}</span>
               <span className="text-[7px] uppercase font-bold px-1 text-center">{space.name}</span>
             </div>
           )}
           {(isRight) && (
             <div
               className="absolute inset-0 flex flex-row items-center justify-center gap-1"
               style={{ writingMode: 'vertical-rl' }}
             >
               <span className={`material-symbols-outlined text-2xl ${iconColor} -rotate-90`}>{icon}</span>
               <span className="text-[7px] uppercase font-bold px-1 text-center">{space.name}</span>
             </div>
           )}
           {(!isLeft && !isRight) && (
             <div className="flex flex-col items-center justify-center w-full h-full">
               <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
               <span className="text-[7px] mt-1 uppercase font-bold px-1 text-center">{space.name}</span>
             </div>
           )}
         </div>
       );
    }
  }

  return (
    <div
      className={spaceClasses}
      style={{ gridColumn: col, gridRow: row }}
    >
      {content}

      {/* Player Tokens */}
      {players.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-1 pointer-events-none">
          {players.map(p => (
            <div
              key={p.id}
              className="w-3 h-3 rounded-full border border-white shadow-md z-20"
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
        </div>
      )}

      {/* Ownership Indicator */}
      {!isCorner && space.ownerId && (
        <div className="absolute inset-0 border-2 rounded pointer-events-none"
             style={{ borderColor: space.ownerId ? gameState.players.find(p => p.id === space.ownerId)?.color : 'transparent' }}
        />
      )}
    </div>
  );
};


const Board = ({ gameState }) => {
  return (
    <div className="flex-1 w-full max-w-[800px] bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl flex items-center justify-center">
      <div
        className="rounded-lg shadow-2xl bg-slate-200 mx-auto grid gap-[2px] border-2 border-slate-300 w-full aspect-square relative"
        style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))', gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }}
      >

        {/* Render Spaces */}
        {gameState.board.map(space => (
          <BoardSpace
            key={space.id}
            space={space}
            players={gameState.players.filter(p => p.position === space.id)}
            gameState={gameState}
          />
        ))}

        {/* Center Area */}
        <div className="absolute top-[9%] left-[9%] w-[82%] h-[82%] bg-slate-50 rounded-lg flex flex-col items-center justify-center overflow-hidden z-0">
           <div className="absolute inset-0 opacity-5 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
           </div>

           <div className="flex gap-16 z-10 mb-8">
             <div className="w-24 h-36 bg-orange-100 border-2 border-orange-200 rounded-xl shadow-md flex flex-col items-center justify-center -rotate-3 hover:rotate-0 transition-all cursor-pointer">
               <span className="material-symbols-outlined text-5xl text-orange-400">question_mark</span>
               <span className="text-[10px] font-black text-orange-600 mt-2 uppercase">Ereignis</span>
             </div>
             <div className="w-24 h-36 bg-blue-100 border-2 border-blue-200 rounded-xl shadow-md flex flex-col items-center justify-center rotate-3 hover:rotate-0 transition-all cursor-pointer">
               <span className="material-symbols-outlined text-5xl text-blue-400">featured_play_list</span>
               <span className="text-[10px] font-black text-blue-600 mt-2 uppercase">Gemeinschaft</span>
             </div>
           </div>

           <div className="text-center z-10">
             <h1 className="text-5xl font-black text-slate-200 uppercase tracking-tighter">MONOPOLY</h1>
             <p className="text-primary font-bold text-xs tracking-[0.4em] uppercase opacity-60">Modern Edition</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Board;