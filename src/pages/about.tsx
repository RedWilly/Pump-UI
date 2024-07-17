import React from 'react';
import Layout from '@/components/Layout';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 neon-text">About Pump Fun</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4 neon-text">What is Pump Fun?</h2>
            <p className="text-gray-300">
              Pump Fun is a cutting-edge decentralized platform for creating and trading tokens using bonding curves. 
              Our platform empowers anyone to launch their own token with a unique bonding curve, revolutionizing 
              project funding and community building in the crypto space.
            </p>
          </section>
          
          <section className="card">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4 neon-text">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li><span className="font-bold text-blue-400">Token Creation:</span> Users create tokens by setting name, symbol, and description.</li>
              <li><span className="font-bold text-blue-400">Bonding Curve:</span> Each token&apos;s price is determined by its unique curve.</li>
              <li><span className="font-bold text-blue-400">Buying Tokens:</span> Users buy tokens with BONE, price based on the curve.</li>
              <li><span className="font-bold text-blue-400">Selling Tokens:</span> Users can sell back anytime, also priced by the curve.</li>
              <li><span className="font-bold text-blue-400">Liquidity Pool:</span> Each token has its own pool that grows and shrinks with trades.</li>
            </ol>
          </section>
        </div>
        
        <section className="card mt-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4 neon-text">Benefits of Bonding Curves</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><span className="font-bold text-blue-400">Continuous Liquidity:</span> Tokens can always be bought or sold</li>
            <li><span className="font-bold text-blue-400">Price Discovery:</span> Market determines price based on supply and demand</li>
            <li><span className="font-bold text-blue-400">Incentivized Participation:</span> Early supporters benefit from price appreciation</li>
            <li><span className="font-bold text-blue-400">Customizable:</span> Different curve shapes for various token economics</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;