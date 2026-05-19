import React from 'react';

const Header = ({ theme, toggleTheme }) => {
    return (
        <header className="flex items-center justify-between mt-3 mb-9">
            <div className="flex items-center gap-3">
                <div className="glass flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', border: '1px solid rgba(174, 68, 90, 0.3)' }}>
                    <span className="text-xl" style={{ color: 'var(--magenta)' }}>⌬</span>
                </div>
                <div>
                    <h1 className="font-display text-xl m-0 leading-none">Octoscope</h1>
                    <span className="font-mono text-xs uppercase opacity-70 tracking-widest block mt-1" style={{ fontSize: '10px' }}>
                        github · radiology
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-mono text-xs opacity-60 hidden md:inline-block">
                    powered by github public api
                </span>
                <button
                    onClick={toggleTheme}
                    className="glass grid rounded-full transition hover:scale-110"
                    style={{ width: '40px', height: '40px', placeItems: 'center', cursor: 'pointer', border: 'none' }}
                    title="Toggle theme"
                >
                    {theme === 'dark' ? '☼' : '☾'}
                </button>
            </div>
        </header>
    );
};

export default Header;
