import { ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
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

export function ConvertImage(imageItem: ImageItemInfo, bytes: Uint8Array<ArrayBuffer>, outputMagickFormat: MagickFormat) : Promise<Blob | null>
{
	return new Promise<Blob | null>((resolve) => ImageMagick.read(bytes, image =>
	{
		image.quality = imageItem.outputQuality;
		image.write(outputMagickFormat, data => resolve(new Blob([data], { type: `image/${imageItem.outputFormat}` })));
	}));
}