export class ImageItemInfo
{
	file: File;
	blob: Blob | null;
	name: string; // without extension
	inputFormat: string;
	outputFormat: string;

	constructor(file: File, blob: Blob | null = null, outputFormat: string)
	{
		this.file = file;
		this.blob = blob;
		this.name = file.name.split('.').slice(0, -1).join('.');
		this.inputFormat = file.type.split('/')[1];
		this.outputFormat = outputFormat;
	}
}