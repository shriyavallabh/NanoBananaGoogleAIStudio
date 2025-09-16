/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SparklesIcon } from './icons';

interface HeaderProps {
    queueSize: number;
    isProcessing: boolean;
}

const Header: React.FC<HeaderProps> = ({ queueSize, isProcessing }) => {
  return (
    <header className="w-full py-3 px-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
          <SparklesIcon className="w-7 h-7 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Gemini Image Studio Pro
          </h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-gray-300">API: Ready</span>
        </div>
         <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3 ${isProcessing ? 'animate-pulse' : ''}`}>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${queueSize > 0 ? 'bg-yellow-400' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-gray-300">Queue: {queueSize}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
