import { MagickFormat } from "@imagemagick/magick-wasm";

export const supportedInputExtensions = ['.avif', '.bmp', '.dng', '.gif', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];
export const supportedOutputFormats = ['avif', 'bmp', 'gif', 'jpeg', 'png', 'tiff', 'webp'];

export const GetAvailableOutputFormats = (file: File) : string[] =>
	supportedOutputFormats.filter(format => format !== file.type.split('/')[1]).map(format => format.replace('jpg', 'jpeg').replace('tiff', 'tif').replace('tif', 'tiff'));

const lossyFormats = ['avif', 'dng', 'jpeg', 'webp'];
export const IsFormatLossy = (format: string) : boolean => lossyFormats.includes(format);

export const FormatToMagickFormat = (format: string) : MagickFormat | null =>
{
	const formatMap: Record<string, MagickFormat> =
	{
		'apng': MagickFormat.APng, 'avif': MagickFormat.Avif, 'bmp': MagickFormat.Bmp, 'dng': MagickFormat.Dng,
		'gif': MagickFormat.Gif, 'heic': MagickFormat.Heic, 'heif': MagickFormat.Heif, 'jpg': MagickFormat.Jpeg, 'jpeg': MagickFormat.Jpeg,
		'png': MagickFormat.Png, 'tif': MagickFormat.Tiff, 'tiff': MagickFormat.Tiff, 'webp': MagickFormat.WebP
	};
	return formatMap[format] || null;
};