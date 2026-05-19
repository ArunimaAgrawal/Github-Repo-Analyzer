import React from 'react';

const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center mt-12 mb-6">
            <div className="rounded-full px-4 py-1 font-mono text-xs border" style={{ borderColor: 'rgba(174, 68, 90, 0.3)' }}>
                <span style={{ color: '#27c93f', marginRight: '6px' }}>●</span> LIVE ANALYZER
            </div>

            <h2 className="font-display text-5xl md:text-7xl text-center mt-6 max-w-4xl mx-auto" style={{ lineHeight: '1.05' }}>
                Read a repo like an <span className="text-grad">x-ray.</span>
            </h2>

            <p className="font-mono text-base md:text-lg text-center opacity-85 mt-5 max-w-2xl mx-auto" style={{ lineHeight: '1.6' }}>
                Paste any GitHub link and Octoscope dissects it into languages, contributors, commit pulse, file anatomy and an instant health score.
            </p>
        </section>
    );
};

export default Hero;
