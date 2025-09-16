/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import type { GalleryItem } from '../App';
import { DownloadIcon, XMarkIcon } from './icons';

interface ImageDetailModalProps {
    item: GalleryItem;
    onClose: () => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ item, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        modalRef.current?.focus();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col md:flex-row gap-4 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="image-modal-title"
                tabIndex={-1}
            >
                <div className="flex-grow h-1/2 md:h-full md:w-2/3 bg-gray-950 flex items-center justify-center p-2">
                   <img 
                     src={item.src} 
                     alt={item.prompt} 
                     className="max-w-full max-h-full object-contain"
                   />
                </div>
                <div className="w-full md:w-1/3 p-6 flex flex-col gap-4 overflow-y-auto h-1/2 md:h-full">
                    <div className="flex items-start justify-between">
                         <h2 id="image-modal-title" className="text-2xl font-bold text-gray-100">
                           Image Details
                         </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Prompt</h3>
                        <p className="text-base text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-md max-h-80 overflow-y-auto">{item.prompt}</p>
                    </div>
                    
                    <div className="mt-auto pt-4">
                        <a
                            href={item.src}
                            download={`gemini-studio-pro-${item.id}.png`}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95"
                        >
                           <DownloadIcon className="w-5 h-5" />
                           Download Image
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageDetailModal;