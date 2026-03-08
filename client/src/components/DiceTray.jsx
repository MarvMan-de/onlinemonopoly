import React from 'react';

const DiceFace = ({ value }) => {
  const dots = [];
  for (let i = 0; i < 9; i++) {
    let show = false;
    if (value === 1 && i === 4) show = true;
    else if (value === 2 && (i === 0 || i === 8)) show = true;
    else if (value === 3 && (i === 0 || i === 4 || i === 8)) show = true;
    else if (value === 4 && (i === 0 || i === 2 || i === 6 || i === 8)) show = true;
    else if (value === 5 && (i === 0 || i === 2 || i === 4 || i === 6 || i === 8)) show = true;
    else if (value === 6 && (i === 0 || i === 2 || i === 3 || i === 5 || i === 6 || i === 8)) show = true;

    dots.push(
      <div key={i} className={`w-2 h-2 rounded-full ${show ? 'bg-slate-800 dark:bg-slate-100' : ''}`} />
    );
  }

  return (
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2">
        {dots}
      </div>
    </div>
  );
};

const DiceTray = ({ dice1, dice2, onRoll, disabled }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-6">
        <DiceFace value={dice1 || 1} />
        <DiceFace value={dice2 || 1} />
      </div>

      <button
        onClick={onRoll}
        disabled={disabled}
        className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${
          !disabled ? 'bg-primary hover:bg-primary/90 text-slate-900 shadow-primary/20 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span className="material-symbols-outlined">casino</span>
        Roll Dice
      </button>
    </div>
  );
};

export default DiceTray;