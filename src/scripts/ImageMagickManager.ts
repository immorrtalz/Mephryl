import { ColorSpace, ImageMagick, IMagickImage, initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';

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

	/* const delegates = `> '${Magick.delegates}'`;
	const features = `> '${Magick.features}'`;
	const imageMagickVersion = `> '${Magick.imageMagickVersion}'`;

	const supportedFormats = Magick.supportedFormats.map((format) =>
	{
		 const description = format.description.replace('\'', '\\\'');
		 return `  { format: '${format.format}', description: '${description}', supportsReading: ${format.supportsReading}, supportsWriting: ${format.supportsWriting} }`;
	}).join(",\n"); */
}

export function ConvertImage(bytes: Uint8Array<ArrayBuffer>, targetFormat: MagickFormat, mimeType: string) : Promise<Blob | null>
{
	var isLossyFormat : boolean = targetFormat === MagickFormat.Jpg || targetFormat === MagickFormat.Jpeg || targetFormat === MagickFormat.WebP;
	return new Promise<Blob | null>((resolve) => ImageMagick.read(bytes, image => image.write(targetFormat, data => resolve(new Blob([data], { type: mimeType })))));

	/* class OutputOptions
	{
		[key: string]: any
	};
	const defaultOptions: OutputOptions = { quality : 80 };

	interface IMagickImageInfo
	{
		readonly colorSpace: ColorSpace;
		readonly compression: CompressionMethod;
		readonly density: Density;
		readonly format: MagickFormat;
		readonly height: number;
		readonly interlace: Interlace;
		readonly orientation: Orientation;
		readonly quality: number;
		readonly width: number;
		read(array: ByteArray, settings?: MagickReadSettings): void;
	}

	//if (targetFormat === MagickFormat.Jpeg && defaultOptions.quality !== undefined) image.quality = defaultOptions.quality;

	// Пример настройки качества для JPEG
	if (targetFormat === MagickFormat.Jpeg) {
		ImageMagick.read(bytes, image => {
			image.quality = 85; // Установите нужное качество
			image.write(targetFormat, data => {
				result = new Blob([data], { type: mimeType });
			});
		});
	} */
}