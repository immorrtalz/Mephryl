import { Magick, ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
import { ImageItemInfo } from './ImageItemInfo';

const wasmLocation = './magick.wasm';
export var isMagickInitialized: boolean = false;

export function InitMagick() : Promise<void>
{
	if (isMagickInitialized) return Promise.resolve();

	return Promise.resolve(
		fetch(wasmLocation)
			.then(response => response.arrayBuffer())
			.then(buffer => initializeImageMagick(buffer))
			.then(() => { isMagickInitialized = true; })
	);
}

export function GetSupportedFormats() { return Magick.supportedFormats; }

export interface ImageDimensions
{
	width: number;
	height: number;
}

export function GetImageDimensions(bytes: Uint8Array<ArrayBuffer>) : Promise<ImageDimensions | null>
{
	return new Promise<ImageDimensions>((resolve, reject) =>
	{
		try { ImageMagick.read(bytes, image => resolve({ width: image.baseWidth, height: image.baseHeight })); }
		catch (error) { reject(error); }
	});
}

export function ConvertImage(imageItem: ImageItemInfo, bytes: Uint8Array<ArrayBuffer>, outputMagickFormat: MagickFormat) : Promise<Blob | null>
{
	return new Promise<Blob | null>((resolve) => ImageMagick.read(bytes, image =>
	{
		image.quality = imageItem.outputQuality;
		image.write(outputMagickFormat, data => resolve(new Blob([new Uint8Array(data)], { type: `image/${imageItem.outputFormat}` })));
	}));
}