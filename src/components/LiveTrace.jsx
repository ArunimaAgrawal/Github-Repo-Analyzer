import React from 'react';

const LiveTrace = () => {
    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-12">
            <div className="flex items-end justify-between mb-3 px-2">
                <h3 className="font-display text-2xl md:text-3xl m-0">live trace</h3>
                <span className="font-mono text-xs opacity-60">simulation</span>
            </div>

            <div className="glass rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(174, 68, 90, 0.3)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <div className="rounded-full" style={{ width: '12px', height: '12px', backgroundColor: '#ff5f56' }}></div>
                    <div className="rounded-full" style={{ width: '12px', height: '12px', backgroundColor: '#ffbd2e' }}></div>
                    <div className="rounded-full" style={{ width: '12px', height: '12px', backgroundColor: '#27c93f' }}></div>
                    <span className="font-mono text-xs opacity-65 ml-2 text-white">octoscope ~ idle</span>
                </div>

                <div className="p-5 font-mono text-xs text-left" style={{ backgroundColor: 'rgba(10, 9, 13, 0.9)', color: 'rgba(255,255,255,0.9)', minHeight: '180px' }}>
                    <p className="mt-2" style={{ color: '#fff' }}>$ waiting for input...</p>
                    <p className="mt-2" style={{ opacity: 0.6 }}>› systems ready</p>
                </div>
            </div>
        </div>
    );
};

export default LiveTrace;
