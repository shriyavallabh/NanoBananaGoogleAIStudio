/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GalleryItem } from '../App';
import { PhotoIcon } from './icons';

interface GalleryProps {
  gallery: GalleryItem[];
  onImageSelect: (item: GalleryItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ gallery, onImageSelect }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-2 backdrop-blur-sm h-1/2 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <PhotoIcon className="w-6 h-6 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200">Gallery</h3>
      </div>
       <div className="flex-grow overflow-y-auto pr-2">
        {gallery.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Your generated images will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map(item => (
              <button 
                key={item.id} 
                className="group relative rounded-lg overflow-hidden shadow-lg animate-fade-in block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                onClick={() => onImageSelect(item)}
              >
                <img src={item.src} alt={item.prompt} className="w-full h-full object-cover aspect-square" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-xs text-gray-200 overflow-hidden flex items-end text-left">
                    <p className="line-clamp-4">{item.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;