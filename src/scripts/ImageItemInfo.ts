import { ImageFormat, supportedImageFormats } from "./FormatsTools";

export class ImageItemInfo
{
	file: File;
	blob: Blob | null;
	name: string; // without extension
	inputFormat: ImageFormat;
	outputFormat: ImageFormat;
	outputQuality: number;

	constructor(file: File, blob: Blob | null = null)
	{
		this.file = file;
		this.blob = blob;
		this.name = file.name.split('.').slice(0, -1).join('.');
		this.inputFormat = supportedImageFormats.find(format => format.mimeType === file.type) ?? supportedImageFormats[0];
		this.outputFormat = supportedImageFormats[0];
		this.outputQuality = 100;
	}
}