/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality } from "@google/genai";

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

/**
 * Parses a base64 data URL into a format suitable for the Gemini API.
 * @param base64 The base64 data URL (e.g., "data:image/png;base64,...").
 * @returns An object with mimeType and data.
 */
const fileToGenerativePart = (base64: string) => {
    const match = base64.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid base64 string format');
    }
    const mimeType = match[1];
    const data = match[2];
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};

/**
 * Generates an image.
 * If referenceImages are provided, it uses a multimodal model to understand both text and images.
 * If no referenceImages are provided, it uses a dedicated text-to-image model.
 * @param prompt The text prompt describing the desired image.
 * @param aspectRatio The desired aspect ratio of the generated image.
 * @param referenceImages An array of base64 data URLs for reference images.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateImage = async (
    prompt: string,
    aspectRatio: AspectRatio,
    referenceImages: string[] = []
): Promise<string> => {
    console.log(`Generating image with prompt: "${prompt}", aspect ratio: ${aspectRatio}, references: ${referenceImages.length}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    try {
        // --- Multimodal Generation (Text + Image Input) ---
        if (referenceImages.length > 0) {
            // The image editing model expects a single reference image.
            if (referenceImages.length > 1) {
                console.warn(`The image editing model supports only one reference image. Using the first of ${referenceImages.length} provided images.`);
            }
            
            const parts = [
                fileToGenerativePart(referenceImages[0]), // Use only the first image
                { text: prompt },
            ];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts }, // Corrected: must be an object for single-turn requests
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                const base64ImageBytes: string = imagePart.inlineData.data;
                const mimeType = imagePart.inlineData.mimeType;
                const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
                console.log('Multimodal image generated successfully.');
                return imageUrl;
            } else {
                console.error('API response did not contain valid image data for multimodal request.', response);
                throw new Error('Image generation failed: No image data received from multimodal API.');
            }
        } 
        // --- Text-to-Image Generation ---
        else {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: aspectRatio,
                },
            });

            if (response.generatedImages?.[0]?.image?.imageBytes) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                console.log('Text-to-image generated successfully.');
                return imageUrl;
            } else {
                console.error('API response did not contain valid image data for text-to-image request.', response);
                throw new Error('Image generation failed: No image data received from API.');
            }
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        let errorMessage = 'An unknown error occurred during image generation.';
        if (error instanceof Error) {
            errorMessage = error.message;
            const geminiError = error as any;
            if (geminiError.response?.promptFeedback?.blockReason) {
                errorMessage = `Request blocked: ${geminiError.response.promptFeedback.blockReason}.`;
            }
        }
        throw new Error(errorMessage);
    }
};

/**
 * Upscales an image to 4x its resolution using a multimodal model.
 * @param base64Image The base64 data URL of the image to upscale.
 * @returns A promise that resolves to the data URL of the upscaled image.
 */
export const upscaleImage = async (base64Image: string): Promise<string> => {
    console.log('Upscaling image...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    try {
        const imagePart = fileToGenerativePart(base64Image);
        const textPart = {
            text: "Please upscale this image to 4x its original resolution. Focus on enhancing details and clarity without adding, removing, or changing any elements in the original image."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] }, // Corrected: must be an object for single-turn requests
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const outputImagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (outputImagePart?.inlineData) {
            const base64ImageBytes: string = outputImagePart.inlineData.data;
            const mimeType = outputImagePart.inlineData.mimeType;
            const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            console.log('Image upscaled successfully.');
            return imageUrl;
        } else {
            console.error('API response did not contain valid image data for upscale request.', response);
            throw new Error('Upscaling failed: No image data received from API.');
        }
    } catch (error) {
        console.error('Error calling Gemini API for upscaling:', error);
        let errorMessage = 'An unknown error occurred during image upscaling.';
         if (error instanceof Error) {
            errorMessage = error.message;
            const geminiError = error as any;
            if (geminiError.response?.promptFeedback?.blockReason) {
                errorMessage = `Request blocked: ${geminiError.response.promptFeedback.blockReason}.`;
            }
        }
        throw new Error(errorMessage);
    }
};