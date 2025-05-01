import { ImageMagick, IMagickImage, initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';
import { useEffect } from 'react';

const wasmLocation = './magick.wasm';
export var isMagickInitialized: boolean = false;

export function InitMagick() : Promise<void>
{
	// disable in SSR
	if (typeof window === 'undefined') return Promise.resolve();

	return fetch(wasmLocation)
		.then(response => response.arrayBuffer())
		.then(buffer => initializeImageMagick(buffer))
		.then(() => { isMagickInitialized = true; });

	/* const delegates = `> '${Magick.delegates}'`;
	const features = `> '${Magick.features}'`;
	const imageMagickVersion = `> '${Magick.imageMagickVersion}'`;

	const supportedFormats = Magick.supportedFormats.map((format) =>
	{
		 const description = format.description.replace('\'', '\\\'');
		 return `  { format: '${format.format}', description: '${description}', supportsReading: ${format.supportsReading}, supportsWriting: ${format.supportsWriting} }`;
	}).join(",\n"); */
}

export function ConvertImage(bytes : Uint8Array<ArrayBuffer>, targetFormat : MagickFormat, mimeType : string) : Blob | null
{
	var result: Blob | null = null;
	ImageMagick.read(bytes, image => image.write(targetFormat, data => result = new Blob([data], { type: mimeType })));
	return result;
}