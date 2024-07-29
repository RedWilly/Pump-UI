import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Bondle. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-4">
            <Link href="/about" className="text-xs text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <a href="https://x.com/rink3y" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
              Twitter
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;