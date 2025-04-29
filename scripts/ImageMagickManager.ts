import { initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';

const wasmLocation = './magick.wasm';
export var isMagickInitialized: boolean = false;

export function InitMagick() : Promise<void>
{
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