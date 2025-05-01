import styles from './App.module.scss';
import { Button, ButtonType } from './components/Button';
import { ConvertSVG, DownloadSVG, LinkSVG, LogoTextSVG, SettingsSVG, UploadSVG } from './components/SVGLibrary';
import { ChangeEvent, createElement, useEffect, useRef, useState } from 'react';
import { ImageMagick, initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';
import { isMagickInitialized, InitMagick, ConvertImage } from './scripts/ImageMagickManager';
import UploadedImageItem from './components/UploadedImageItem';

const supportedExtensions = '.apng, .avif, .bmp, .dng, .gif, .hdr, .heic, .heif, .ico, .jpg, .jpeg, .png, .raw, .tga, .tif, .tiff, .webp';

class ConvertedImage
{
	blob : Blob;
	name : string;
	ext : string;

	constructor(blob : Blob, name : string, ext : string)
	{
		this.blob = blob;
		this.name = name;
		this.ext = ext;
	}
}

export default function App()
{
	const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([]);
	const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
	const [isUploadPhase, setIsUploadPhase] = useState(true);

	var mainElement : HTMLElement | null;
	var mainTitle : HTMLElement | null;
	var mainDescription : HTMLElement | null;
	var imageInput : HTMLInputElement | null;
	var buttonsContainer1 : HTMLElement | null;
	var buttonsContainer2 : HTMLElement | null;
	var buttonsContainer3 : HTMLElement | null;
	var dragAndDropText : HTMLElement | null;
	var toolLimitsText : HTMLElement | null;
	var uploadedImagesContainer : HTMLElement | null;

	function convertImageFile(file : File) : Promise<ConvertedImage | null>
	{
		return new Promise<ConvertedImage | null>((resolve) =>
		{
			var reader = new FileReader();

			reader.onload = (e) =>
			{
				if (!e.target) return;
				const result = (e.target.result as string); //base64 string

				// Определяем формат изображения по dataURL
				const isPng = result.startsWith('data:image/png');
				const isJpg = result.startsWith('data:image/jpeg') || result.startsWith('data:image/jpg');

				var targetFormat: MagickFormat = MagickFormat.Jpeg;
				var mimeType = 'image/jpeg';
				var downloadExt = 'jpg';

				if (isJpg)
				{
					targetFormat = MagickFormat.Png;
					mimeType = 'image/png';
					downloadExt = 'png';
				}
				else if (isPng)
				{
					targetFormat = MagickFormat.Jpeg;
					mimeType = 'image/jpeg';
					downloadExt = 'jpg';
				}

				const binaryString = atob(result.replace(/^data:.*;base64,/, ''));
				const bytes = new Uint8Array(binaryString.length);

				for (var i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

				var blob : Blob | null = ConvertImage(bytes, targetFormat, mimeType);
				return blob ? resolve(new ConvertedImage(blob as Blob, file.name.split('.').slice(0, -1).join('.'), downloadExt)) : resolve(null);
			};

			reader.readAsDataURL(file);
		});
	}

	async function convertImageFiles()
	{
		setIsUploadPhase(false);

		if (mainTitle) mainTitle.innerText = 'Converting...';
		if (mainDescription) mainDescription.innerText = `It shouldn't take long`;

		const files : File[] = uploadedImageFiles;

		for (const file of files)
		{
			const convertedFile = await convertImageFile(file);
			if (convertedFile) setConvertedImages(current => [...current, convertedFile]);
		}

		if (mainTitle) mainTitle.innerHTML = 'Your&nbsp;images are&nbsp;ready!';
		if (mainDescription) mainDescription.innerHTML = `Save&nbsp;them&nbsp;– they’ll&nbsp;be&nbsp;lost when&nbsp;you&nbsp;close&nbsp;the&nbsp;page`;
	};

	function downloadConvertedImage(convertedImage: ConvertedImage)
	{
		const url = URL.createObjectURL(convertedImage.blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `${convertedImage.name}.${convertedImage.ext}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}

	function downloadConvertedImages()
	{
		const images : ConvertedImage[] = convertedImages;
		images.forEach(image => { downloadConvertedImage(image); });
	}

	useEffect(() =>
	{
		mainElement = document.querySelector('main');
		mainTitle = document.querySelector(`.${styles.mainTitle}`);
		mainDescription = document.querySelector(`.${styles.mainDescription}`);
		imageInput = document.getElementById('imageInput') as HTMLInputElement;
		buttonsContainer1 = document.querySelector(`.${styles.buttonsContainer1}`);
		buttonsContainer2 = document.querySelector(`.${styles.buttonsContainer2}`);
		buttonsContainer3 = document.querySelector(`.${styles.buttonsContainer3}`);
		dragAndDropText = document.querySelector(`.${styles.dragAndDropText}`);
		toolLimitsText = document.querySelector(`.${styles.toolLimitsText}`);
		uploadedImagesContainer = document.querySelector(`.${styles.uploadedImagesContainer}`);
	});

	useEffect(() =>
	{
		if (uploadedImageFiles.length > 0)
		{
			buttonsContainer1?.classList.add('displayNone');
			buttonsContainer2?.classList.remove('displayNone');
			dragAndDropText?.classList.add('displayNone');
			toolLimitsText?.classList.add('displayNone');
			uploadedImagesContainer?.classList.remove('displayNone');
		}
		else
		{
			buttonsContainer1?.classList.remove('displayNone');
			buttonsContainer2?.classList.add('displayNone');
			dragAndDropText?.classList.remove('displayNone');
			toolLimitsText?.classList.remove('displayNone');
			uploadedImagesContainer?.classList.add('displayNone');
		}
	}, [uploadedImageFiles]);

	useEffect(() =>
	{
		if (convertedImages.length > 0)
		{
			buttonsContainer2?.classList.add('displayNone');
			buttonsContainer3?.classList.remove('displayNone');
		}
		else buttonsContainer3?.classList.add('displayNone');
	}, [convertedImages]);

	function onImageInputChange()
	{
		if (!imageInput?.files) return;
		const files = Array.from(imageInput.files);
		setUploadedImageFiles(current => [...current, ...files]);
		imageInput.files = null;
	};

	function selectImageFiles() { imageInput?.click(); }

	function handleImageFilesDragOver(e : React.DragEvent<HTMLDivElement>)
	{
		e.preventDefault();
		mainElement?.classList.add(styles.mainOnDragOver);
	}

	function handleImageFilesDragEnd(e : React.DragEvent<HTMLDivElement>)
	{
		e.preventDefault();
		mainElement?.classList.remove(styles.mainOnDragOver);
	}

	function handleDroppedImageFiles(e : React.DragEvent<HTMLDivElement>)
	{
		e.preventDefault();
		handleImageFilesDragEnd(e);

		if (e.dataTransfer.items)
		{
			const files = Array.from(e.dataTransfer.files);
			setUploadedImageFiles(current => [...current, ...files]);
		}
	}

	function onRemoveUploadedImageFile(file : File) { setUploadedImageFiles(current => current.filter(f => f !== file)); };
	function onDownloadConvertedImage(index : number) { downloadConvertedImage(convertedImages[index]); };

	InitMagick().then(() => console.log('ImageMagick initialized'));

	return (
		<div className={styles.pageContainer}>

			<input id='imageInput' onChange={onImageInputChange} type='file' accept={supportedExtensions} multiple/>

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

			<main className={isUploadPhase ? styles.uploadPhase : ''} {...(isUploadPhase ? { onDrop: handleDroppedImageFiles, onDragOver: handleImageFilesDragOver, onDragLeave: handleImageFilesDragEnd } : {})}>
				<h1 className={`${styles.mainTitle} fontSemibold`}>Convert&nbsp;images for&nbsp;free</h1>
				<p className={`${styles.mainDescription} colorWhite50 font20`}>Supported formats are: PNG, JPG, GIF, WEBP, TIF, ICO and many others</p>

				<div className={styles.buttonsContainer1}>
					<Button
						title='Upload'
						svg={<UploadSVG/>}
						onClick={selectImageFiles}/>

					{/* <Button
						svg={<LinkSVG/>}
						square/> */}
				</div>

				<div className={`${styles.uploadedImagesContainer} displayNone`}>
					{uploadedImageFiles.map((file, index) => <UploadedImageItem key={index} file={file} uploadPhase={isUploadPhase} onRemove={onRemoveUploadedImageFile} onDownload={() => onDownloadConvertedImage(index)}/>)}
				</div>

				<p className={`${styles.dragAndDropText} colorWhite50 font14`}>or just drag & drop them here</p>

				<div className={`${styles.buttonsContainer2} displayNone`}>
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
						onClick={convertImageFiles}/>
				</div>

				<div className={`${styles.buttonsContainer3} displayNone`}>
					<Button
						type={ButtonType.Secondary}
						title='Convert more'
						svg={<ConvertSVG/>}
						onClick={() => window.location.reload()}/>

					<Button
						title='Download all'
						svg={<DownloadSVG/>}
						onClick={downloadConvertedImages}/>
				</div>

				<p className={`${styles.toolLimitsText} colorWhite50 font14`}>This tool uses your hardware, so – good privacy and no artificial restrictions.
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