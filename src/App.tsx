import styles from './App.module.scss';
import { Button, ButtonType } from './components/Button';
import { ConvertSVG, DownloadSVG, LogoTextSVG, SettingsSVG, UploadSVG } from './components/SVGLibrary';
import { useEffect, useState } from 'react';
import { MagickFormat } from '@imagemagick/magick-wasm';
import { InitMagick, ConvertImage } from './scripts/ImageMagickManager';
import { ImageItemInfo } from './scripts/ImageItemInfo';
import ImageItem from './components/ImageItem';

const supportedInputExtensions = ['.avif', '.bmp', '.dng', '.gif', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];
const supportedOutputFormats = ['avif', 'bmp', 'gif', 'jpeg', 'png', 'tiff', 'webp'];

const getAvailableOutputFormats = (file: File) : string[] =>
	supportedOutputFormats.filter(format => format !== file.type.split('/')[1]).map(format => format.replace('jpg', 'jpeg').replace('tif', 'tiff').replace('tifff', 'tiff'));

export default function App()
{
	const [imageItems, setImageItems] = useState<ImageItemInfo[]>([]);
	/*
	0 - default, 0 uploaded, can upload
	1 - at least 1 uploaded, can upload
	2 - converting, can't do anything
	3 - convert finished, can download */
	const [phaseIndex, setPhaseIndex] = useState(0);

	var mainElement: HTMLElement | null;
	var mainTitle: HTMLElement | null;
	var mainDescription: HTMLElement | null;
	var imageInput: HTMLInputElement | null;

	function convertImage(index : number) : Promise<Blob | null>
	{
		return new Promise<Blob | null>((resolve, reject) =>
		{
			var reader = new FileReader();

			reader.onload = (e) =>
			{
				if (!e.target) return reject('File read error');
				const result = e.target.result as string; //base64 string

				const inputMagickFormat: MagickFormat | null = formatToMagickFormat(imageItems[index].inputFormat);
				var outputMagickFormat: MagickFormat | null = formatToMagickFormat(imageItems[index].outputFormat);

				if (!inputMagickFormat) return reject('Unsupported input image format');
				if (!outputMagickFormat) return reject('Unsupported output image format');

				const blob = ConvertImage(imageItems[index], Uint8Array.from(atob(result.split(',')[1]), c => c.charCodeAt(0)), outputMagickFormat);
				return blob ? resolve(blob) : resolve(null);
			};

			reader.readAsDataURL(imageItems[index].file);
		});
	}

	async function convertAllImages()
	{
		setPhaseIndex(2);
		if (mainTitle) mainTitle.innerText = 'Converting...';
		if (mainDescription) mainDescription.innerHTML = `It&nbsp;shouldn't take&nbsp;long`;

		for (var i = 0; i < imageItems.length; i++)
		{
			const convertedBlob = await convertImage(i);
			convertedBlob ? imageItems[i].blob = convertedBlob : console.error(`Error converting image ${imageItems[i].file.name}`); //TODO: make error popup dialog window
		}

		setPhaseIndex(3);
		if (mainTitle) mainTitle.innerHTML = 'Your&nbsp;images are&nbsp;ready!';
		if (mainDescription) mainDescription.innerHTML = `Save&nbsp;them&nbsp;– they’ll&nbsp;be&nbsp;lost when&nbsp;you&nbsp;close&nbsp;the&nbsp;page`;
	};

	function downloadConvertedImage(index: number)
	{
		if (imageItems[index].blob)
		{
			const url = URL.createObjectURL(imageItems[index].blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = `${imageItems[index].name}.${imageItems[index].outputFormat}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);
		}
		else console.error(`Error downloading image ${imageItems[index].name}.${imageItems[index].outputFormat}`);
	}

	function downloadAllConvertedImages()
	{
		for (var i = 0; i < imageItems.length; i++) downloadConvertedImage(i);
	}

	useEffect(() =>
	{
		mainElement = document.querySelector('main');
		mainTitle = document.querySelector(`.${styles.mainTitle}`);
		mainDescription = document.querySelector(`.${styles.mainDescription}`);
		imageInput = document.getElementById('imageInput') as HTMLInputElement;
	});

	useEffect(() => setPhaseIndex(imageItems.length > 0 ? 1 : 0), [imageItems]);

	function onImageInputChange()
	{
		if (!imageInput?.files) return;
		setImageItemsWithFiles(Array.from(imageInput.files));
		imageInput.files = null;
	};

	const selectImageFiles = () => imageInput?.click();

	function handleImageFilesDragOver(e: React.DragEvent<any>)
	{
		e.preventDefault();
		mainElement?.classList.add(styles.mainOnDragOver);
	}

	function handleImageFilesDragEnd(e: React.DragEvent<any>)
	{
		e.preventDefault();
		mainElement?.classList.remove(styles.mainOnDragOver);
	}

	function handleDroppedImageFiles(e: React.DragEvent<any>)
	{
		handleImageFilesDragEnd(e);
		if (e.dataTransfer.items) setImageItemsWithFiles(Array.from(e.dataTransfer.files));
	}

	const setImageItemsWithFiles = (files: File[]) => setImageItems(current => [...current, ...files.map(file => new ImageItemInfo(file, null, getAvailableOutputFormats(file)[0]))]);
	const onRemoveUploadedImageFile = (file: File) => setImageItems(current => current.filter(imageItem => imageItem.file !== file));

	function formatToMagickFormat(format: string) : MagickFormat | null
	{
		switch (format)
		{
			case 'apng': return MagickFormat.APng;
			case 'avif': return MagickFormat.Avif;
			case 'bmp': return MagickFormat.Bmp;
			case 'dng': return MagickFormat.Dng;
			case 'gif': return MagickFormat.Gif;
			case 'heic': return MagickFormat.Heic;
			case 'heif': return MagickFormat.Heif;
			case 'jpg': return MagickFormat.Jpeg;
			case 'jpeg': return MagickFormat.Jpeg;
			case 'png': return MagickFormat.Png;
			case 'tif': return MagickFormat.Tiff;
			case 'tiff': return MagickFormat.Tiff;
			case 'webp': return MagickFormat.WebP;
			default: return null;
		}
	}

	InitMagick().then(() => console.log('ImageMagick initialized'));

	return (
		<div className={styles.pageContainer}>

			<input id='imageInput' onChange={onImageInputChange} type='file' accept={supportedInputExtensions.join(', ')} multiple/>

			<header>
				<div className={styles.logo}>
					<img className={styles.logoImg} src='./src/assets/logo.png'/>
					<LogoTextSVG className={styles.logoSVG}/>
				</div>

				<a className={`${styles.linkUnderLogo} colorWhite50 font14 bgBlur`}
					href='https://evermedia.immorrtalz.com'
					target='_blank'>
					by <span>EVERMEDIA PROJECT</span>
				</a>
			</header>

			<main {...(phaseIndex <= 1 ? { className: styles.uploadPhase, onDrop: handleDroppedImageFiles, onDragOver: handleImageFilesDragOver, onDragLeave: handleImageFilesDragEnd } : {})}>
				<h1 className={`${styles.mainTitle} fontSemibold`}>Convert&nbsp;images for&nbsp;free</h1>
				<p className={`${styles.mainDescription} colorWhite50 font20`}>Supported formats are: PNG, JPG, GIF, WEBP and more</p>

				<div className={`${styles.buttonsContainer1} ${phaseIndex > 0 ? 'displayNone' : ''}`}>
					<Button
						title='Upload'
						svg={<UploadSVG/>}
						onClick={selectImageFiles}/>

					{/* <Button
						svg={<LinkSVG/>}
						square/> */}
				</div>

				<div className={`${styles.uploadedImagesContainer} ${phaseIndex > 0 ? '' : 'displayNone'}`}>
					{
						imageItems.map((imageItem, index) =>
							<ImageItem
								key={index}
								imageItem={imageItem}
								phaseIndex={phaseIndex}
								supportedConvertFormats={getAvailableOutputFormats(imageItem.file)}
								onChangeOutputFormat={(outputFormat: string) => setImageItems(current => current.map((item, i) => i == index ? { ...item, outputFormat: outputFormat } : item))}
								onChangeOutputQuality={(outputQuality: number) => setImageItems(current => current.map((item, i) => i == index ? { ...item, outputQuality: outputQuality } : item))}
								onDownload={() => downloadConvertedImage(index)}
								onRemove={onRemoveUploadedImageFile}/>)
					}
				</div>

				<p className={`${styles.dragAndDropText} colorWhite50 font14 ${phaseIndex > 0 ? 'displayNone' : ''}`}>or just drag & drop them here</p>

				<div className={`${styles.buttonsContainer2} ${phaseIndex == 1 ? '' : 'displayNone'}`}>
					<Button
						type={ButtonType.Secondary}
						title='Upload more'
						svg={<UploadSVG/>}
						onClick={selectImageFiles}/>

					{/* <Button
						type={ButtonType.Secondary}
						svg={<LinkSVG/>}
						square/> */}

					<Button
						type={ButtonType.Secondary}
						square
						svg={<SettingsSVG/>}/>

					<Button
						title='Convert all'
						svg={<ConvertSVG/>}
						onClick={convertAllImages}/>
				</div>

				<div className={`${styles.buttonsContainer3} ${phaseIndex == 3 ? '' : 'displayNone'}`}>
					<Button
						type={ButtonType.Secondary}
						title='Convert more'
						svg={<ConvertSVG/>}
						onClick={() => window.location.reload()}/>

					<Button
						title='Download all'
						svg={<DownloadSVG/>}
						onClick={downloadAllConvertedImages}/>
				</div>

				<p className={`${styles.toolLimitsText} colorWhite50 font14 ${phaseIndex > 0 ? 'displayNone' : ''}`}>This tool uses your hardware, so – good privacy and no artificial restrictions.
This is why it's completely free.</p>
			</main>

			<footer>
				<p className={`${styles.footerItem} font14`}>© {new Date().getFullYear()}, EVERMEDIA PROJECT</p>
				<p className={`${styles.footerItem} font14`}>Made with 💜</p>
				<a className={`${styles.footerItem} font14`}
					href='https://github.com/immorrtalz/mephryl'
					target='_blank'>
					View on GitHub
				</a>
			</footer>

		</div>
	);
}