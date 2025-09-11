import { MagickFormat } from "@imagemagick/magick-wasm";
import { ImageItemInfo } from "./ImageItemInfo";

export class ImageFormat
{
	name: string;
	extension: string;
	mimeType: string;
	magickFormat: MagickFormat;
	isLossy: boolean;

	constructor(name: string, extension: string, mimeType: string, magickFormat: MagickFormat, isLossy: boolean)
	{
		this.name = name;
		this.extension = extension;
		this.mimeType = mimeType;
		this.magickFormat = magickFormat;
		this.isLossy = isLossy;
	}
}

export const supportedImageFormats = [
	new ImageFormat('avif', '.avif', 'image/avif', MagickFormat.Avif, true),
	new ImageFormat('bmp', '.bmp', 'image/bmp', MagickFormat.Bmp, false),
	new ImageFormat('exr', '.exr', 'image/x-exr', MagickFormat.Exr, false),
	new ImageFormat('gif', '.gif', 'image/gif', MagickFormat.Gif, false),
	new ImageFormat('jpg', '.jpg', 'image/jpeg', MagickFormat.Jpg, true),
	new ImageFormat('jpeg', '.jpeg', 'image/jpeg', MagickFormat.Jpg, true),
	new ImageFormat('jp2', '.jp2', 'image/jp2', MagickFormat.Jp2, true),
	new ImageFormat('j2k', '.j2k', 'image/jp2', MagickFormat.J2k, true),
	new ImageFormat('jpm', '.jpm', 'image/jpm', MagickFormat.Jpm, true),
	new ImageFormat('j2c', '.j2c', 'image/jp2', MagickFormat.J2c, true),
	new ImageFormat('jpc', '.jpc', 'image/jp2', MagickFormat.Jpc, true),
	new ImageFormat('jxl', '.jxl', 'image/jxl', MagickFormat.Jxl, true),
	new ImageFormat('png', '.png', 'image/png', MagickFormat.Png, false),
	new ImageFormat('tif', '.tif', 'image/tiff', MagickFormat.Tif, false),
	new ImageFormat('tiff', '.tiff', 'image/tiff', MagickFormat.Tif, false),
	new ImageFormat('webp', '.webp', 'image/webp', MagickFormat.WebP, true)
];

export const GetAvailableOutputFormats = (file: ImageItemInfo): string[] => supportedImageFormats
	.filter(outputFormat => file.inputFormat.mimeType !== outputFormat.mimeType && !['jpeg', 'tiff'].includes(outputFormat.name)).map(format => format.name);