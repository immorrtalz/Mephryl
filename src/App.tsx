import styles from './App.module.scss';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from "motion/react";
import { Button, ButtonType } from './components/Button';
import { SVG } from './components/SVGLibrary';
import { MagickFormat } from '@imagemagick/magick-wasm';
import { ImageMagickManager } from './scripts/ImageMagickManager';
import { ImageItemInfo } from './scripts/ImageItemInfo';
import ImageItem from './components/ImageItem';
import { ModalWindow } from './components/ModalWindow';
import { Slider } from './components/Slider';
import { supportedInputExtensions, GetAvailableOutputFormats, FormatToMagickFormat } from './scripts/FormatsTools';

export default function App()
{
	const [imageMagickManager] = useState(new ImageMagickManager());
	const [magickState, setMagickState] = useState<'uninitialized' | 'initializing' | 'initialized'>('uninitialized');

	/*
	0 - default, 0 uploaded, can upload
	1 - at least 1 uploaded, can upload
	2 - converting, can't do anything
	3 - convert finished, can download */
	const [phaseIndex, setPhaseIndex] = useState(0);
	const [error, setError] = useState("");

	const [imageItems, setImageItems] = useState<ImageItemInfo[]>([]);

	const [isQualityModalOpened, setQualityModalOpened] = useState(false);
	const [qualityModalTargetIndex, setQualityModalTargetIndex] = useState(-1);
	const [qualityValue, setQualityValue] = useState(100);

	const imageInput = useRef<HTMLInputElement>(null);
	const [isImageFilesDraggingOver, setIsImageFilesDraggingOver] = useState(false);

	const convertImage = (index : number) : Promise<Blob | null> =>
	{
		return new Promise<Blob | null>((resolve, reject) =>
		{
			var reader = new FileReader();

			reader.onload = e =>
			{
				if (!e.target)
				{
					setError('File read error');
					return reject('File read error');
				}

				const result = e.target.result as string; //base64 string

				const inputMagickFormat: MagickFormat | null = FormatToMagickFormat(imageItems[index].inputFormat);
				var outputMagickFormat: MagickFormat | null = FormatToMagickFormat(imageItems[index].outputFormat);

				if (!inputMagickFormat)
				{
					setError('Unsupported input image format');
					return reject('Unsupported input image format');
				}

				if (!outputMagickFormat)
				{
					setError('Unsupported output image format');
					return reject('Unsupported output image format');
				}

				const blob = imageMagickManager.ConvertImage(imageItems[index], Uint8Array.from(atob(result.split(',')[1]), c => c.charCodeAt(0)), outputMagickFormat);
				return blob ? resolve(blob) : resolve(null);
			};

			reader.readAsDataURL(imageItems[index].file);
		});
	};

	async function convertAllImages()
	{
		setPhaseIndex(2);

		for (var i = 0; i < imageItems.length; i++)
		{
			const convertedBlob = await convertImage(i);
			convertedBlob ? imageItems[i].blob = convertedBlob : setError(`Error converting image ${imageItems[i].file.name}`);
		}

		setPhaseIndex(3);
	}

	const saveConvertedImage = (index: number) =>
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
		else setError(`Error downloading image ${imageItems[index].name}.${imageItems[index].outputFormat}`);
	};

	const saveAllConvertedImages = () =>
	{
		for (var i = 0; i < imageItems.length; i++) saveConvertedImage(i);
	};

	const onImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		if (!e.target.files) return;
		addImageItems(Array.from(e.target.files));
		e.target.files = null;
	};

	const selectImageFiles = () => imageInput.current?.click();

	const handleImageFilesDragOver = (e: React.DragEvent<any>) =>
	{
		e.preventDefault();
		if (e.dataTransfer.items && e.dataTransfer.files.length > 0) setIsImageFilesDraggingOver(true);
	};

	const handleImageFilesDragEnd = (e: React.DragEvent<any>) =>
	{
		e.preventDefault();
		setIsImageFilesDraggingOver(false);
	};

	const handleDroppedImageFiles = (e: React.DragEvent<any>) =>
	{
		handleImageFilesDragEnd(e);
		if (e.dataTransfer.items) addImageItems(Array.from(e.dataTransfer.files));
	};

	const addImageItems = (files: File[]) => setImageItems(prev => [...prev, ...files.map(file => new ImageItemInfo(file, null, GetAvailableOutputFormats(file)[0]))]);
	const onRemoveUploadedImageFile = (file: File) => setImageItems(prev => prev.filter(imageItem => imageItem.file !== file));

	const openQualityModal = (targetIndex: number) =>
	{
		setQualityModalTargetIndex(targetIndex);
		setQualityValue(targetIndex == -1 ? 100 : imageItems[targetIndex].outputQuality);
		setQualityModalOpened(true);
	};

	useEffect(() => setPhaseIndex(imageItems.length > 0 ? 1 : 0), [imageItems]);

	return (
		<div className={styles.pageContainer}>

			<input id='imageInput' ref={imageInput} onChange={onImageInputChange} type='file' accept={supportedInputExtensions.join(', ')} multiple/>

			<AnimatePresence>
				{
					isQualityModalOpened && <ModalWindow
						title='Conversion settings'
						okTitle={qualityModalTargetIndex == -1 ? 'Apply to all' : 'Apply'}
						onCancel={() => setQualityModalOpened(false)}
						onOK={() =>
						{
							setImageItems(prev => prev.map((item, i) => qualityModalTargetIndex == -1 || i === qualityModalTargetIndex ? { ...item, outputQuality: qualityValue } : item));
							setQualityModalOpened(false);
						}}>
						<div className='modalContentElement'>
							<p>Quality <span className='font14 colorWhite50'>(usually set to 85-97)</span></p>
							<Slider min={1} max={100} step={1} value={qualityValue} onInput={e => setQualityValue(Number(e.target.value))}/>
							<p style={{width: '28px'}}>{qualityValue}</p>
						</div>
					</ModalWindow>
				}

				{
					magickState !== 'initialized' && <ModalWindow buttons={magickState === 'initializing' ? 0 : 1}
						title={magickState === 'uninitialized' ? 'Attention required' : 'Loading...'} okTitle='Continue'
						onOK={() =>
							{
								setMagickState('initializing');

								imageMagickManager.InitMagick()
									.then(result => setMagickState(result ? 'initialized' : 'uninitialized'))
									.catch(() => setError('Failed to initialize ImageMagick (a library required for the tool to work)'));
							}}>
						{
							magickState === 'uninitialized' ? <p>This tool requires <a href='https://github.com/ImageMagick/ImageMagick' target='_blank'>ImageMagick</a> <a href='https://github.com/dlemstra/magick-wasm' target='_blank'>WASM library</a> to run.
							<br/>
							By pressing "Continue", you agree to download ~13.6 MB of content.</p> :
							<p>Please wait...</p>
						}
					</ModalWindow>
				}

				{ !!error && <ModalWindow buttons={1} title='Error' cancelTitle='Reload the page' cancelSvg='' onCancel={() => window.location.reload()}><p>{error}</p></ModalWindow> }
			</AnimatePresence>

			<header>
				<div className={styles.logo}>
					<img className={styles.logoImg} src='./logo.png'/>
					<SVG name='logoText' className={styles.logoSVG}/>
				</div>

				<a className={`${styles.linkUnderLogo} colorWhite50 font14 bgBlur`}
					href='https://evermedia.immorrtalz.com'
					target='_blank'>
					by <span>EVERMEDIA PROJECT</span>
				</a>
			</header>

			<main className={`${phaseIndex <= 1 ? styles.uploadPhase : ''} ${isImageFilesDraggingOver ? styles.mainOnDragOver : ''}`}
				{...(phaseIndex <= 1 ? { onDrop: handleDroppedImageFiles, onDragOver: handleImageFilesDragOver, onDragLeave: handleImageFilesDragEnd } : {})}>
				<h1 className={`${styles.mainTitle} fontSemibold`}>
					{
						phaseIndex <= 1 ? <>Convert&nbsp;images for&nbsp;free</> :
						phaseIndex == 2 ? 'Converting...' :
						<>Your&nbsp;images are&nbsp;ready!</>
					}
				</h1>

				<p className={`${styles.mainDescription} colorWhite50 font20`}>
					{
						phaseIndex <= 1 ? 'Supported formats are: PNG, JPG, GIF, WEBP and more' :
						phaseIndex == 2 ? <>Please&nbsp;wait,&nbsp;this&nbsp;might take&nbsp;a&nbsp;while</> :
						<>Save&nbsp;them&nbsp;– they'll&nbsp;be&nbsp;lost when&nbsp;you&nbsp;close&nbsp;the&nbsp;page</>
					}
				</p>

				<div className={`${styles.buttonsContainer1} ${phaseIndex > 0 ? 'displayNone' : ''}`}>
					<Button
						title='Upload'
						svg={<SVG name='upload'/>}
						disabled={magickState !== 'initialized'}
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
								supportedConvertFormats={GetAvailableOutputFormats(imageItem.file)}
								onOpenSettings={() => openQualityModal(index)}
								onChangeOutputFormat={(outputFormat: string) => setImageItems(current => current.map((item, i) => i == index ? { ...item, outputFormat: outputFormat } : item))}
								onDownload={() => saveConvertedImage(index)}
								onRemove={onRemoveUploadedImageFile}/>)
					}
				</div>

				<p className={`${styles.dragAndDropText} colorWhite50 font14 ${phaseIndex > 0 ? 'displayNone' : ''}`}>or just drag & drop them here</p>

				<div className={`${styles.buttonsContainer2} ${phaseIndex == 1 ? '' : 'displayNone'}`}>
					<Button
						type={ButtonType.Secondary}
						title='Upload more'
						svg={<SVG name='upload'/>}
						onClick={selectImageFiles}/>

					{/* <Button
						type={ButtonType.Secondary}
						svg={<LinkSVG/>}
						square/> */}

					<Button
						type={ButtonType.Secondary}
						square
						svg={<SVG name='settings'/>}
						onClick={() => openQualityModal(-1)}/>

					<Button
						title='Convert all'
						svg={<SVG name='convert'/>}
						onClick={convertAllImages}/>
				</div>

				<div className={`${styles.buttonsContainer3} ${phaseIndex == 3 ? '' : 'displayNone'}`}>
					<Button
						type={ButtonType.Secondary}
						title='Convert more'
						svg={<SVG name='convert'/>}
						onClick={() => window.location.reload()}/>

					<Button
						title='Save all'
						svg={<SVG name='download'/>}
						onClick={saveAllConvertedImages}/>
				</div>

				<p className={`${styles.toolLimitsText} colorWhite50 font14 ${phaseIndex > 0 ? 'displayNone' : ''}`}>This tool runs on your device locally, so it's free.</p>
			</main>

			<footer>
				<p className={`${styles.footerItem} font14`}>© {new Date().getFullYear()}, EVERMEDIA PROJECT</p>
				<p className={`${styles.footerItem} font14`}>Made with 💙</p>
				<a className={`${styles.footerItem} font14`}
					href='https://github.com/immorrtalz/Mephryl'
					target='_blank'>
					View on GitHub
				</a>
			</footer>

		</div>
	);
}