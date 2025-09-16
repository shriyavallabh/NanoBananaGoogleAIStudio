/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { AspectRatio } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface GenerationPanelProps {
  onAddToQueue: (prompt: string, aspectRatio: AspectRatio) => Promise<void>;
  isQueueProcessing: boolean;
  hasReferenceImages: boolean;
}

const aspectRatios: { name: string; value: AspectRatio }[] = [
  { name: 'Square (1:1)', value: '1:1' },
  { name: 'Landscape (16:9)', value: '16:9' },
  { name: 'Portrait (9:16)', value: '9:16' },
  { name: 'Standard (4:3)', value: '4:3' },
  { name: 'Tall (3:4)', value: '3:4' },
];

const GenerationPanel: React.FC<GenerationPanelProps> = ({ onAddToQueue, isQueueProcessing, hasReferenceImages }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isAdding) {
      setIsAdding(true);
      try {
        await onAddToQueue(prompt, aspectRatio);
        setPrompt('');
      } catch (error) {
        console.error("Error adding to queue:", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-200">Generation</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            hasReferenceImages
              ? "Describe what to do with the reference images... (e.g., 'place the character from image 1 in the background of image 2')"
              : "A photorealistic image of a cat sitting on a couch..."
          }
          rows={5}
          className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full resize-none"
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {aspectRatios.map(ar => (
              <button
                type="button"
                key={ar.value}
                onClick={() => setAspectRatio(ar.value)}
                className={`w-full text-center text-sm font-semibold py-2 px-2 rounded-md transition-all duration-200 ${
                  aspectRatio === ar.value
                    ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500'
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {ar.name}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isAdding}
          className="flex items-center justify-center w-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 disabled:from-gray-600 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          <SparklesIcon className={`w-5 h-5 mr-2 ${isAdding ? 'animate-spin' : ''}`}/>
          {isAdding 
              ? 'Sending to Gemini...' 
              : hasReferenceImages 
                  ? 'Generate with References'
                  : 'Add to Queue'
          }
        </button>
      </form>
    </div>
  );
};

export default GenerationPanel;