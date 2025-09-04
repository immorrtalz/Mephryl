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
	private magickVersionFile = './magickVersion.txt';

	InitMagick(): Promise<boolean>
	{
		return new Promise<boolean>(resolve =>
		{
			caches.match('magickFetchResponse').then(wasmCache =>
			{
				if (wasmCache)
				{
					this.CheckIfNeedsUpdate().then(needsUpdate =>
					{
						if (needsUpdate) caches.delete('magickCache').then(window.location.reload);
						else this.InitMagickFromResponse(wasmCache).then(resolve);
					});
				}
				else this.FetchMagickFromUrl().then(resolve);
			});
		});
	}

	CheckIfNeedsUpdate(): Promise<boolean>
	{
		return fetch(this.magickVersionFile)
			.then(response => response.arrayBuffer())
			.then(arrayBuffer =>
			{
				const prodVersion = new TextDecoder().decode(arrayBuffer);
				return caches.match('magickVersionResponse').then(versionCache => versionCache ? versionCache.text().then(cachedVersion => cachedVersion !== prodVersion) : true);
			});
	}

	FetchMagickFromUrl(): Promise<boolean>
	{
		return fetch(this.wasmLocation)
			.then(response =>
			{
				const clonedResponse = response.clone();
				caches.open('magickCache').then(cache => cache.put('magickFetchResponse', clonedResponse));
				return this.InitMagickFromResponse(response);
			})
			.catch(() => false);
	}

	InitMagickFromResponse(response: Response): Promise<boolean>
	{
		return response.arrayBuffer()
			.then(arrayBuffer => initializeImageMagick(arrayBuffer))
			.then(() =>
			{
				caches.open('magickCache').then(cache => cache.put('magickVersionResponse', new Response(Magick.imageMagickVersion, { headers: { 'Content-Type': 'text/plain' }})));
				console.log(`ImageMagick ver. ${Magick.imageMagickVersion} initialized`);
				return true;
			}).catch(() => false);
	}

	GetSupportedFormats = () => Magick.delegates; // heic jng jp2 jpeg jxl openexr png tiff webp raw (everything except raw supports RW, raw supports R)
	//['.avif', '.bmp', '.dng', '.gif', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];

	ConvertImage(imageItem: ImageItemInfo, bytes: Uint8Array<ArrayBuffer>, outputMagickFormat: MagickFormat): Promise<Blob | null>
	{
		return new Promise<Blob | null>((resolve) => ImageMagick.read(bytes, image =>
		{
			image.quality = imageItem.outputQuality;
			image.write(outputMagickFormat, data => resolve(new Blob([new Uint8Array(data)], { type: `image/${imageItem.outputFormat}` })));
		}));
	}
}