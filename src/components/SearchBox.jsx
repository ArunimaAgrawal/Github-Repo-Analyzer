import React from 'react';

const SearchBox = () => {
    return (
        <div className="w-full max-w-3xl mx-auto mt-9">
            <div className="glass rounded-2xl p-2 flex flex-col md:flex-row items-center gap-3">
                <span className="font-mono text-sm opacity-60 pl-3">
                    github.com/
                </span>
                <input
                    type="text"
                    placeholder="owner/repo"
                    className="flex-1 w-full bg-transparent border-0 font-mono text-sm outline-none px-2 py-3"
                    style={{ color: 'var(--foreground)' }}
                />
                <button className="search-btn rounded-xl px-6 py-3 font-display text-sm font-bold w-full md:w-auto h-12 flex items-center justify-center gap-2 transition hover:scale-102">
                    Analyze →
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs font-mono">
                <span className="opacity-60">try:</span>
                <button className="suggestion-pill rounded-full px-3 py-1 transition">facebook/react</button>
                <button className="suggestion-pill rounded-full px-3 py-1 transition">vercel/next.js</button>
                <button className="suggestion-pill rounded-full px-3 py-1 transition">sveltejs/svelte</button>
            </div>
        </div>
    );
};

export default SearchBox;
