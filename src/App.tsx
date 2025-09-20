import styles from './App.module.scss';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from "motion/react";
import { Button, ButtonType } from './components/Button';
import { SVG } from './components/SVGLibrary';
import { ImageMagickManager } from './scripts/ImageMagickManager';
import { ImageItemInfo } from './scripts/ImageItemInfo';
import ImageItem from './components/ImageItem';
import { ModalWindow } from './components/ModalWindow';
import { Slider } from './components/Slider';
import { ImageFormat, supportedImageFormats, GetOutputFormats } from './scripts/FormatsTools';
import { Dropdown } from './components/Dropdown';
import { Checkbox } from './components/Checkbox';

export default function App()
{
	const [imageMagickManager] = useState(new ImageMagickManager());
	const [magickState, setMagickState] = useState<'checkingForUpdates' | 'needsUpdate' | 'uninitializedWithCache' | 'uninitializedWithoutCache' | 'initializing' | 'initialized'>('checkingForUpdates');

	/*
	0 - default, 0 uploaded, can upload
	1 - at least 1 uploaded, can upload
	2 - converting, can't do anything
	3 - convert finished, can download */
	const [phaseIndex, setPhaseIndex] = useState(0);
	const [error, setError] = useState("");

	const [imageItems, setImageItems] = useState<ImageItemInfo[]>([]);

	const [isConvertOptionsOpened, setConvertOptionsOpened] = useState(false);
	const [convertOptionsTargetIndex, setConvertOptionsTargetIndex] = useState(-1);
	const [outputFormat, setOutputFormat] = useState<ImageFormat>(supportedImageFormats[0]);
	const [qualityValue, setQualityValue] = useState(100);
	const [convertOptionsCheckmarks, setConvertOptionsCheckmarks] = useState([true, true]);

	const imageInput = useRef<HTMLInputElement>(null);
	const [isImageFilesDraggingOver, setIsImageFilesDraggingOver] = useState(false);

	const convertImage = (index: number): Promise<Blob | null> =>
	{
		return new Promise<Blob | null>((resolve, reject) =>
		{
			var reader = new FileReader();

			reader.onload = e =>
			{
				if (!e.target) return reject(`File read error for ${imageItems[index].file.name}`);

				const base64Result = e.target.result as string;
				imageMagickManager.ConvertImage(imageItems[index], Uint8Array.from(atob(base64Result.split(',')[1]), c => c.charCodeAt(0)), imageItems[index].outputFormat.magickFormat)
					.then(resolve);
			};

			reader.readAsDataURL(imageItems[index].file);
		});
	};

	async function convertAllImages()
	{
		setPhaseIndex(2);

		for (var i = 0; i < imageItems.length; i++)
		{
			const convertedBlob = await convertImage(i).catch(e => setError(e));
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
			link.download = imageItems[index].name + imageItems[index].outputFormat.extension;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);
		}
		else setError(`Error downloading image ${imageItems[index].name}${imageItems[index].outputFormat.extension}`);
	};

	const saveAllConvertedImages = () =>
	{
		for (var i = 0; i < imageItems.length; i++) saveConvertedImage(i);
	};

	const onImageInput = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		if (!e.target.files) return;
		addImageItems(Array.from(e.target.files));
		e.target.value = '';
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

	const addImageItems = (files: File[]) => setImageItems(prev => [...prev, ...files.map(file => new ImageItemInfo(file))]);
	const onRemoveUploadedImageFile = (file: File) => setImageItems(prev => prev.filter(imageItem => imageItem.file !== file));

	const openConvertOptions = (targetIndex: number) =>
	{
		setConvertOptionsTargetIndex(targetIndex);
		setOutputFormat(imageItems[targetIndex == -1 ? 0 : targetIndex].outputFormat);
		setQualityValue(targetIndex == -1 ? 100 : imageItems[targetIndex].outputQuality);
		setConvertOptionsOpened(true);
	};

	const initMagick = () =>
	{
		setMagickState('initializing');

		imageMagickManager.InitMagick()
			.then(result => setMagickState(result ? 'initialized' : 'uninitializedWithoutCache'))
			.catch(() => setError('Failed to initialize ImageMagick (a library required for the tool to work)'));
	}

	useEffect(() => setPhaseIndex(imageItems.length ? 1 : 0), [imageItems]);

	useEffect(() =>
	{
		imageMagickManager.CheckIfCacheNeedsUpdate()
			.then(needsUpdate => imageMagickManager.CheckIfHasCache()
				.then(hasCache =>
				{
					setMagickState(needsUpdate ? 'needsUpdate' : hasCache ? 'uninitializedWithCache' : 'uninitializedWithoutCache');
					if (!needsUpdate && hasCache) initMagick();
				}));
	}, []);

	return (
		<div className={styles.pageContainer}>

			<input id='imageInput' ref={imageInput} onInput={onImageInput} type='file' accept={supportedImageFormats.map(format => format.extension).join(', ')} multiple/>

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
						phaseIndex <= 1 ? 'Supported formats: PNG, JPG, TIF, WEBP and more' :
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
						svg={<SVG name='link'/>}
						square/> */}
				</div>

				<div className={`${styles.uploadedImagesContainer} ${phaseIndex > 0 ? '' : 'displayNone'}`}>
					{
						imageItems.map((imageItem, index) =>
							<ImageItem
								key={`${imageItem.file.name}-${imageItem.outputFormat.name}-${index}`}
								imageItem={imageItem}
								phaseIndex={phaseIndex}
								onOpenSettings={() => openConvertOptions(index)}
								onChangeOutputFormat={(outputFormat: ImageFormat) => setImageItems(current => current.map((item, i) => i == index ? { ...item, outputFormat: outputFormat } : item))}
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
						svg={<SVG name='link'/>}
						square/> */}

					<Button
						type={ButtonType.Secondary}
						square
						svg={<SVG name='settings'/>}
						onClick={() => openConvertOptions(-1)}/>

					<Button
						title={'Convert' + (imageItems.length == 1 ? '' : ' all')}
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

			<AnimatePresence>
				{
					isConvertOptionsOpened && <ModalWindow
						title='Conversion settings'
						okTitle={convertOptionsTargetIndex === -1 ? 'Apply to all' : 'Apply'}
						onCancel={() => setConvertOptionsOpened(false)}
						onOK={convertOptionsTargetIndex != -1 || convertOptionsCheckmarks.some(Boolean) ? () =>
						{
							setImageItems(prev => prev.map((item, i) =>
							{
								const isTargetItem = convertOptionsTargetIndex === -1 || convertOptionsTargetIndex === i;
								if (!isTargetItem) return item;

								const shouldUpdateFormat = convertOptionsTargetIndex === i || (convertOptionsTargetIndex === -1 && convertOptionsCheckmarks[0]);
								const shouldUpdateQuality = convertOptionsTargetIndex === i || (convertOptionsTargetIndex === -1 && convertOptionsCheckmarks[1] && (!convertOptionsCheckmarks[0] || outputFormat.isLossy));

								return {...item, outputFormat: shouldUpdateFormat ? outputFormat : item.outputFormat, outputQuality: shouldUpdateQuality ? qualityValue : item.outputQuality};
							}));

							setConvertOptionsOpened(false);
						} : undefined}>

						{
							convertOptionsTargetIndex === -1 && <div className={`modalContentElement ${phaseIndex == 1 ? '' : 'displayNone'}`}>
								{
									convertOptionsTargetIndex === -1 &&
										<Checkbox checked={convertOptionsCheckmarks[0]} onChange={e => setConvertOptionsCheckmarks([e.target.checked, convertOptionsCheckmarks[1]])}/>
								}
								<p>Convert all to</p>
								<Dropdown
									options=
									{
										GetOutputFormats().map(format => (
										{
											title: format.toUpperCase(),
											value: format
										}))
									}
									currentOptionIndex={GetOutputFormats().findIndex(formatName => formatName === outputFormat.name)}
									onOptionClick={(format: string) => setOutputFormat(supportedImageFormats.find(f => f.name === format)!)}
									disabled={convertOptionsTargetIndex === -1 && !convertOptionsCheckmarks[0]}/>
							</div>
						}

						<div className='modalContentElement'>
							{
								convertOptionsTargetIndex === -1 &&
									<Checkbox checked={convertOptionsCheckmarks[1]} onChange={e => setConvertOptionsCheckmarks([convertOptionsCheckmarks[0], e.target.checked])}/>
							}
							<p>Quality <span className='font14 colorWhite50'>(usually set to 85-97)</span></p>
							<Slider min={1} max={100} step={1} value={qualityValue} onInput={e => setQualityValue(Number(e.target.value))}
								disabled={convertOptionsTargetIndex === -1 && (!convertOptionsCheckmarks[1] || convertOptionsCheckmarks[0] && !outputFormat.isLossy)}/>
							<p style={{ width: '28px' }}>{qualityValue}</p>
						</div>
					</ModalWindow>
				}

				{
					magickState !== 'uninitializedWithCache' && magickState !== 'initialized' && <ModalWindow buttons={magickState === 'needsUpdate' || magickState === 'uninitializedWithoutCache' ? 1 : 0}
						title={magickState === 'checkingForUpdates' ? 'Checking for updates...' :
							magickState === 'needsUpdate' ? 'Update required' :
							magickState === 'uninitializedWithoutCache' ? 'Attention required' :
							'Loading...'}
						okTitle={magickState === 'needsUpdate' ? 'Update' : 'Continue'}
						{...magickState === 'needsUpdate' ? { okSvg: 'convert' } : {}}
						onOK={magickState !== 'initializing' ? () =>
							{
								if (magickState === 'needsUpdate') imageMagickManager.UpdateMagick();
								else initMagick();
							} : undefined}>
						{
							magickState === 'needsUpdate' ? <p>This will clear the cache and reload the page</p> :
							magickState === 'uninitializedWithoutCache' ? <p>This tool requires <a href='https://github.com/ImageMagick/ImageMagick' target='_blank'>ImageMagick</a> <a href='https://github.com/dlemstra/magick-wasm' target='_blank'>WASM library</a> to run.
							<br/>
							By pressing "Continue", you agree to download ~13.7 MB of content.</p> :
							<p>Please wait...</p>
						}
					</ModalWindow>
				}

				{ !!error && <ModalWindow buttons={1} title='Error' cancelTitle='Reload the page' cancelSvg='' onCancel={() => window.location.reload()}><p>{error}</p></ModalWindow> }
			</AnimatePresence>

		</div>
	);
}