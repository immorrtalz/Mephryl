export const supportedInputExtensions = ['.avif', '.bmp', '.dng', '.gif', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];
export const supportedOutputFormats = ['avif', 'bmp', 'gif', 'jpeg', 'png', 'tiff', 'webp'];

const lossyFormats = ['avif', 'dng', 'jpeg', 'webp'];
export const IsFormatLossy = (format: string) : boolean => lossyFormats.includes(format);