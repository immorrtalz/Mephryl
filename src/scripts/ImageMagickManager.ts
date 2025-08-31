import { Magick, ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
import { ImageItemInfo } from './ImageItemInfo';

export interface ImageDimensions
{
	width: number;
	height: number;
}

export class ImageMagickManager
{
	private wasmLocation = './magick.wasm';
	private isMagickInitialized = false;

	InitMagick(): Promise<void>
	{
		if (this.isMagickInitialized) return Promise.resolve();

		return new Promise<void>((resolve, reject) =>
		{
			fetch(this.wasmLocation)
				.then(response => response.arrayBuffer())
				.then(arrayBuffer => initializeImageMagick(arrayBuffer))
				.then(() =>
				{
					this.isMagickInitialized = true;
					resolve();
				})
				.catch(reject);
		});
	}

	GetSupportedFormats = () => Magick.delegates; // heic jng jp2 jpeg jxl openexr png tiff webp raw (everything except raw supports RW, raw supports R)

	ConvertImage(imageItem: ImageItemInfo, bytes: Uint8Array<ArrayBuffer>, outputMagickFormat: MagickFormat) : Promise<Blob | null>
	{
		return new Promise<Blob | null>((resolve) => ImageMagick.read(bytes, image =>
		{
			image.quality = imageItem.outputQuality;
			image.write(outputMagickFormat, data => resolve(new Blob([new Uint8Array(data)], { type: `image/${imageItem.outputFormat}` })));
		}));
	}
}