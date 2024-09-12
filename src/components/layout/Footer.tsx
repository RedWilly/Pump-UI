// Footer.tsx

import React from 'react';
import Link from 'next/link';
import { MessageCircleIcon, TwitterIcon } from 'lucide-react';


const Footer: React.FC = () => {
  return (
    <footer className="bg-[#000000] py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <p className="text-[10px] sm:text-xs text-gray-400">
              © {new Date().getFullYear()} DEGFun. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-4">
            <Link href="/about" className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/FAQ" className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <a href="https://t.me/degfun" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <MessageCircleIcon className="h-4 w-4 mr-1" /> {/* change the url to the telegram channel/group */}
            </a>
            <a href="https://x.com/DEGFunETH" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <TwitterIcon className="h-4 w-4 mr-1" /> {/* change the url to the twitter handle */}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;