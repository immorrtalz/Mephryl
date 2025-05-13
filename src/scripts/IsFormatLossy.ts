const lossyFormats = ['avif', 'dng', 'jpeg', 'webp'];
export const IsFormatLossy = (format: string) : boolean => lossyFormats.includes(format);