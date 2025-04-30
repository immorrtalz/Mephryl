import styles from './App.module.scss';
import { Button } from './components/Button';
import { LinkSVG, LogoSVG, UploadSVG } from './components/SVGLibrary';
import { useEffect, useRef } from 'react';
import { ImageMagick, initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';
import { isMagickInitialized, InitMagick } from './scripts/ImageMagickManager';
import UploadedImageItem from './components/UploadedImageItem';

const supportedExtensions = '.apng, .avif, .bmp, .dng, .eps, .gif, .hdr, .heic, .heif, .ico, .jpg, .jpeg, .png, .psd, .raw, .svg, .tga, .tif, .tiff, .webp';

export default function App()
{
	//const [count, setCount] = useState(0);

	InitMagick().then(() => console.log('ImageMagick initialized'));

	const onImageInputChange = () =>
	{
		//if (imageInputRef.current === null) return;
		if (imageInput.files === undefined || imageInput.files === null) return;

		var file = imageInput.files[0];
		var reader = new FileReader();

		reader.onload = (e) =>
		{
			const result = (e.target!.result as string);

			// Определяем формат изображения по dataURL
			const isPng = result.startsWith('data:image/png');
			const isJpg = result.startsWith('data:image/jpeg') || result.startsWith('data:image/jpg');

			let targetFormat: MagickFormat = MagickFormat.Jpeg;
			let downloadMime = 'image/jpeg';
			let downloadExt = 'jpg';

			if (isJpg)
			{
				targetFormat = MagickFormat.Png;
				downloadMime = 'image/png';
				downloadExt = 'png';
			}
			else if (isPng)
			{
				targetFormat = MagickFormat.Jpeg;
				downloadMime = 'image/jpeg';
				downloadExt = 'jpg';
			}

			// Убираем префикс dataURL, оставляем только base64
			const base64Data = result.replace(/^data:.*;base64,/, '');

			// Преобразуем base64 в Uint8Array для ImageMagick.read
			const binaryString = atob(base64Data);
			const len = binaryString.length;
			const bytes = new Uint8Array(len);

			for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

			ImageMagick.read(bytes, image =>
			{
				image.write(targetFormat, data =>
				{
					const blob = new Blob([data], { type: downloadMime });
					const url = URL.createObjectURL(blob);

					const link = document.createElement('a');
					link.href = url;
					link.download = `converted-image.${downloadExt}`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					URL.revokeObjectURL(url);
				});
			});
		};

		reader.readAsDataURL(file);
	};

	const imageInput = Object.assign(document.createElement('input'),
	{
		id: 'imageInput',
		onchange: onImageInputChange,
		type: 'file',
		accept: supportedExtensions,
		multiple: true,
	});

	var mainElement : HTMLElement | null;
	const setMainElement = () => { mainElement = document.querySelector('main'); };

	function selectImageFiles() { imageInput.click(); }

	function handleImageFilesDragOver(e : React.DragEvent<HTMLDivElement>) 
	{
		e.preventDefault();
		if (mainElement == null || mainElement == undefined) setMainElement();
		mainElement?.classList.add(styles.mainOnDragOver);
	}

	function handleImageFilesDragEnd(e : React.DragEvent<HTMLDivElement>) 
	{
		e.preventDefault();
		if (mainElement == null || mainElement == undefined) setMainElement();
		mainElement?.classList.remove(styles.mainOnDragOver);
	}

	function handleDroppedImageFiles(e : React.DragEvent<HTMLDivElement>)
	{
		e.preventDefault();
		console.log(e);
	}

	return (
		<div className={styles.pageContainer}>

			{/* <input id='imageInput' className={styles.imageInput} onChange={onImageInputChange} type='file' accept={supportedExtensions} multiple/> */}

			<header>
				<LogoSVG className={styles.logo}/>

				<a className={`${styles.linkUnderLogo} colorWhite50 font14 bgBlur`}
					href='https://evermedia.immorrtalz.com'
					target='_blank'>
					by <span>EVERMEDIA PROJECT</span>
				</a>
			</header>

			<main onDrop={handleDroppedImageFiles} onDragOver={handleImageFilesDragOver} onDragLeave={handleImageFilesDragEnd}>
				<h1 className='fontSemibold'>Convert&nbsp;images for&nbsp;free</h1>
				<p className={`${styles.mainDescription} colorWhite50 font20`}>Supported formats are: PNG, JPG, WEBP, TIF and GIF</p>

				<div className={styles.buttonsContainer}>
					<Button
						title='Upload'
						svg={<UploadSVG/>}
						onClick={selectImageFiles}/>

					{/* <Button
						square
						svg={<LinkSVG/>}/> */}
				</div>

				{/* <div className={styles.uploadedImagesContainer}>
					<UploadedImageItem/>
					<UploadedImageItem/>
					<UploadedImageItem/>
					<UploadedImageItem/>
				</div> */}

				<p className={`${styles.dragAndDropText} colorWhite50 font14`}>or just drag & drop them here</p>
				<p className={`${styles.toolLimitsText} colorWhite50 font14`}>This tool uses your hardware, so that is the only limitation.
		This is why it's completely free.</p>
			</main>

			<footer>
				<p className={`${styles.footerItem} font14`}>© {new Date().getFullYear()}, EVERMEDIA PROJECT</p>
				<p className={`${styles.footerItem} font14`}>Made with 💜</p>
				<a className={`${styles.footerItem} font14`}
					href='https://github.com/immorrtalz/Mephryl'
					target='_blank'
					rel='noopener noreferrer'>
					View on GitHub
				</a>
			</footer>

		</div>
	);
}