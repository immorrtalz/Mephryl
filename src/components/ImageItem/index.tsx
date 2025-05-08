import { useState } from 'react';
import styles from './ImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { DeleteSVG, DownloadSVG, SettingsSVG } from '../SVGLibrary';
import { Dropdown } from '../Dropdown';
import { ImageItemInfo } from '../../scripts/ImageItemInfo';

interface Props
{
	imageItem: ImageItemInfo;
	phaseIndex: number;
	supportedConvertFormats: string[];
	onChangeConvertFormat?: (...args : any[]) => any;
	onDownload?: (...args: any[]) => any;
	onRemove?: (...args: any[]) => any;
}

export default function UploadedImageItem(props: Props)
{
	const onChangeConvertFormat = (format: string) => props.onChangeConvertFormat?.(format);
	const onDownload = () => props.onDownload?.();
	function onRemove() { if (props.imageItem.file) props.onRemove?.(props.imageItem.file); };

	const [imageDimensions, setImageDimensions] = useState('Error loading image dimensions');

	const fileSizeUnits = ['Bytes', 'KB', 'MB'];
	var fileSize: number = props.phaseIndex == 3 && props.imageItem.blob ? props.imageItem.blob.size : props.imageItem.file.size;
	var fileSizeType: string = fileSizeUnits[0];

	var fileSizeUnitIndex = 0;
	for (; fileSizeUnitIndex < fileSizeUnits.length && fileSize >= 1024; fileSizeUnitIndex++) fileSize /= 1024;
	fileSizeType = fileSizeUnits[fileSizeUnitIndex];

	return (
		<div className={styles.uploadedImageItem}>
			<img src={window.URL.createObjectURL(props.imageItem.file)} onLoad={e => setImageDimensions(`${(e.target as HTMLImageElement).naturalWidth}x${(e.target as HTMLImageElement).naturalHeight}px`)}/>
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
										onOptionClick={(format : string) => {onChangeConvertFormat(format)}}/>) : <></>
							}

							<Button
								type={ButtonType.Secondary}
								svg={<SettingsSVG/>}
								square
								/* onClick={} *//>

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