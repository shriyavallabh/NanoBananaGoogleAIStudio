/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ReferenceImagePanel from './components/ReferenceImagePanel';
import GenerationPanel from './components/GenerationPanel';
import QueuePanel from './components/QueuePanel';
import Gallery from './components/Gallery';
import ImageDetailModal from './components/ImageDetailModal';
import { generateImage, type AspectRatio } from './services/geminiService';

export interface Job {
  id: string;
  prompt: string;
  referenceImages: string[];
  aspectRatio: AspectRatio;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface GalleryItem {
  id:string;
  src: string;
  prompt: string;
}

const App: React.FC = () => {
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [queue, setQueue] = useState<Job[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const isProcessingRef = useRef(false);
  
  // Load from local storage on initial render
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem('gemini-studio-gallery');
      if (savedGallery) setGallery(JSON.parse(savedGallery));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);
  
  // Save gallery to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('gemini-studio-gallery', JSON.stringify(gallery));
    } catch (e) {
      console.error("Failed to save gallery to localStorage", e);
    }
  }, [gallery]);
  

  const handleAddToQueue = async (prompt: string, aspectRatio: AspectRatio) => {
    const newJob: Job = {
        id: crypto.randomUUID(),
        prompt,
        referenceImages: referenceImages,
        aspectRatio,
        status: 'pending',
    };
    
    setQueue(prev => [...prev, newJob]);
    setReferenceImages([]); // Clear references after adding to queue
  };
  
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queue.length === 0) {
      return;
    }

    const job = queue.find(j => j.status === 'pending');
    if (!job) {
      return; // No pending jobs
    }

    isProcessingRef.current = true;
    setQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j));

    try {
      const imageUrl = await generateImage(job.prompt, job.aspectRatio, job.referenceImages);
      const newGalleryItem: GalleryItem = {
        id: crypto.randomUUID(),
        src: imageUrl,
        prompt: job.prompt,
      };
      setGallery(prev => [newGalleryItem, ...prev]);
      setQueue(prev => prev.filter(j => j.id !== job.id));
    } catch (error) {
      console.error('Generation failed for job:', job.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: errorMessage } : j));
    } finally {
      isProcessingRef.current = false;
    }
  }, [queue]);

  useEffect(() => {
    const processingInterval = setInterval(() => {
      processQueue();
    }, 1000); // Check queue every second

    return () => clearInterval(processingInterval);
  }, [processQueue]);

  const handleSelectImage = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  }
  
  const handleUpscaleImage = (itemId: string, newSrc: string) => {
    // Update the gallery with the new upscaled image source
    setGallery(prevGallery => 
      prevGallery.map(item => 
        item.id === itemId ? { ...item, src: newSrc } : item
      )
    );
    // Update the selected image in the modal as well
    setSelectedImage(prevSelected => 
        prevSelected && prevSelected.id === itemId 
        ? { ...prevSelected, src: newSrc } 
        : prevSelected
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 overflow-hidden">
      <Header queueSize={queue.length} isProcessing={isProcessingRef.current || queue.some(j => j.status === 'processing')} />
      <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* === Left Control Column === */}
        <aside className="w-full md:w-full md:max-w-md lg:max-w-lg flex flex-col gap-4 overflow-y-auto pr-2">
          <ReferenceImagePanel 
            images={referenceImages}
            onImagesChange={setReferenceImages}
          />
          <GenerationPanel
            onAddToQueue={handleAddToQueue}
            isQueueProcessing={isProcessingRef.current}
            hasReferenceImages={referenceImages.length > 0}
          />
        </aside>

        {/* === Right Content Column === */}
        <section className="w-full flex-grow flex flex-col gap-4 overflow-hidden">
           <QueuePanel queue={queue} />
           <Gallery gallery={gallery} onImageSelect={handleSelectImage} />
        </section>
      </main>
      {/* Fix: Corrected typo from handleCloseOmit to handleCloseModal */}
      {selectedImage && <ImageDetailModal item={selectedImage} onClose={handleCloseModal} onUpscale={handleUpscaleImage} />}
    </div>
  );
};

export default App;