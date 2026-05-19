import React from 'react';

const FeatureCard = ({ number, title, description }) => (
    <div className="glass rounded-2xl p-6 relative overflow-hidden transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
        <span className="font-mono text-xs opacity-50 absolute top-4 left-4">{number}</span>
        <h3 className="font-display text-lg md:text-xl mt-6 mb-2">{title}</h3>
        <p className="font-mono text-sm opacity-80" style={{ lineHeight: '1.6' }}>{description}</p>
    </div>
);

const FeaturesGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl mx-auto">
            <FeatureCard
                number="01"
                title="Language atlas"
                description="A beautiful breakdown of the exact technology stack with detailed byte-level metrics and historical trends."
            />
            <FeatureCard
                number="02"
                title="Repo health check"
                description="Instant Octoscore based on response rates, issue resolution times, community engagement and recent activity."
            />
            <FeatureCard
                number="03"
                title="Contributor orbit"
                description="See exactly who holds the project together, identifying core maintainers vs casual contributors in one glance."
            />
        </div>
    );
};

export default FeaturesGrid;
