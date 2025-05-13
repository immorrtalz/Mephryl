import { useState } from 'react';
import styles from './ImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { DeleteSVG, DownloadSVG, SettingsSVG } from '../SVGLibrary';
import { Dropdown } from '../Dropdown';
import { ImageItemInfo } from '../../scripts/ImageItemInfo';
import { ModalWindow } from '../ModalWindow';
import { Slider } from '../Slider';
import { IsFormatLossy } from '../../scripts/IsFormatLossy';

interface Props
{
	imageItem: ImageItemInfo;
	phaseIndex: number;
	supportedConvertFormats: string[];
	onChangeOutputFormat?: (...args : any[]) => any;
	onChangeOutputQuality?: (...args : any[]) => any;
	onDownload?: (...args: any[]) => any;
	onRemove?: (...args: any[]) => any;
}

export default function UploadedImageItem(props: Props)
{
	function onChangeOutputFormat(format: string)
	{
		if (!IsFormatLossy(props.imageItem.outputFormat)) onChangeOutputQuality(100);
		props.onChangeOutputFormat?.(format);
	}

	const onChangeOutputQuality = (quality: number) => props.onChangeOutputQuality?.(quality);
	const onDownload = () => props.onDownload?.();
	function onRemove() { if (props.imageItem.file) props.onRemove?.(props.imageItem.file); };

	const [imageDimensions, setImageDimensions] = useState('Error loading image dimensions');

	const fileSizeUnits = ['Bytes', 'KB', 'MB'];
	var fileSize: number = props.phaseIndex == 3 && props.imageItem.blob ? props.imageItem.blob.size : props.imageItem.file.size;
	var fileSizeType: string = fileSizeUnits[0];

	var fileSizeUnitIndex = 0;
	for (; fileSizeUnitIndex < fileSizeUnits.length && fileSize >= 1024; fileSizeUnitIndex++) fileSize /= 1024;
	fileSizeType = fileSizeUnits[fileSizeUnitIndex];

	const [isModalOpened, setModalOpened] = useState(false);
	const [qualityValue, setQualityValue] = useState(97);

	return (
		<div className={styles.uploadedImageItem}>
			<img src={props.imageItem.inputFormat == 'dng' ? './src/assets/imagePreviewPlaceholder.jpg' : window.URL.createObjectURL(props.imageItem.file)} onLoad={e => setImageDimensions(`${(e.target as HTMLImageElement).naturalWidth}x${(e.target as HTMLImageElement).naturalHeight}px`)}/>
			<div className={styles.textsContainer}>
				<p className={`${styles.title} fontMedium`}>{props.phaseIndex == 3 ? `${props.imageItem.name}.${props.imageItem.outputFormat}` : props.imageItem.file.name}</p>
				<p className={`${styles.info} font12`}>{imageDimensions} • {Math.floor(fileSize * 100) / 100} {fileSizeType}</p>
			</div>

			<div className={styles.buttonsContainer}>
				{
					props.phaseIndex <= 1 ? (
						<>
							{
								props.supportedConvertFormats.length !== 0 ? (
									<Dropdown
										options=
										{
											props.supportedConvertFormats.map((format) => (
											{
												title: format.toUpperCase(),
												value: format
											}))
										}
										onOptionClick={(format : string) => {onChangeOutputFormat(format)}}/>) : <></>
							}

							{
								IsFormatLossy(props.imageItem.outputFormat) ? (
									<>
										<Button
											type={ButtonType.Secondary}
											svg={<SettingsSVG/>}
											square
											onClick={() => setModalOpened(true)}/>

										<ModalWindow open={isModalOpened}
											title='Conversion settings'
											okTitle='Apply'
											onCancel={() => setModalOpened(false)}
											onOK={() =>
											{
												onChangeOutputQuality(qualityValue);
												setModalOpened(false);
											}}>
											<div className={styles.modalContentElement}>
												<p>Quality <span className='font14 colorWhite50'>(usually set to 85-97)</span></p>
												<Slider min={1} max={100} defaultValue={97} step={1} onInput={(e) => setQualityValue(Number(e.target.value))}/>
												<p style={{width: '28px'}}>{qualityValue}</p>
											</div>
										</ModalWindow>
									</>) : <></>
							}

							<Button
								type={ButtonType.SecondaryDestructive}
								svg={<DeleteSVG/>}
								square
								onClick={onRemove}/>
						</>
					) : props.phaseIndex == 3 ? (
						<Button
							type={ButtonType.Secondary}
							svg={<DownloadSVG/>}
							square
							onClick={onDownload}/>
					) : <></>
				}
			</div>
		</div>
	);
}