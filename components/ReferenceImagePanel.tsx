/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { PhotoIcon, PlusIcon, XCircleIcon, UploadIcon } from './icons';

interface ReferenceImagePanelProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const MAX_IMAGES = 4;

const ReferenceImagePanel: React.FC<ReferenceImagePanelProps> = ({ images, onImagesChange }) => {

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - images.length);
    
    const base64Promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    });

    try {
      const newImages = await Promise.all(base64Promises);
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error("Error reading files:", error);
    }
    e.target.value = ''; // Allow re-uploading the same file
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <PhotoIcon className="w-6 h-6 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200">Reference Images</h3>
        <span className="text-sm text-gray-400 ml-auto">({images.length}/{MAX_IMAGES})</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((src, index) => (
          <div key={index} className="relative group aspect-square">
            <img src={src} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-md bg-gray-900/50" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label={`Remove image ${index + 1}`}
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
           <label htmlFor="image-upload" className="cursor-pointer aspect-square flex flex-col items-center justify-center bg-gray-700/50 hover:bg-gray-700/80 text-gray-400 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-md transition-colors">
              <UploadIcon className="w-8 h-8 mb-1"/>
              <span className="text-xs font-semibold">Upload</span>
            </label>
        )}
      </div>
       <input 
        id="image-upload" 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload} 
        disabled={images.length >= MAX_IMAGES}
      />

    </div>
  );
};

export default ReferenceImagePanel;