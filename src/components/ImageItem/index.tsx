import { useState } from 'react';
import styles from './ImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { SVG } from '../SVGLibrary';
import { Dropdown } from '../Dropdown';
import { ImageItemInfo } from '../../scripts/ImageItemInfo';
import { IsFormatLossy } from '../../scripts/FormatsTools';

interface Props
{
	imageItem: ImageItemInfo;
	phaseIndex: number;
	supportedConvertFormats: string[];
	onOpenSettings?: (...args : any[]) => any;
	onChangeOutputFormat?: (...args : any[]) => any;
	onChangeOutputQuality?: (...args : any[]) => any;
	onDownload?: (...args: any[]) => any;
	onRemove?: (...args: any[]) => any;
}

export default function UploadedImageItem(props: Props)
{
	const onOpenSettings = () => props.onOpenSettings?.();
	const onChangeOutputFormat = (format: string) => props.onChangeOutputFormat?.(format);
	const onDownload = () => props.onDownload?.();
	const onRemove = () => props.imageItem.file ? props.onRemove?.(props.imageItem.file) : undefined;

	const [imageDimensions, setImageDimensions] = useState('Error parsing image dimensions');

	const fileSizeUnits = ['Bytes', 'KB', 'MB'];
	var fileSize = props.phaseIndex == 3 && props.imageItem.blob ? props.imageItem.blob.size : props.imageItem.file.size;
	for (var fileSizeUnitIndex = 0; fileSizeUnitIndex < fileSizeUnits.length && fileSize >= 1024; fileSizeUnitIndex++) fileSize /= 1024;

	return (
		<div className={styles.uploadedImageItem}>
			<img src={props.imageItem.inputFormat == 'dng' ? './src/assets/imagePreviewPlaceholder.jpg' : window.URL.createObjectURL(props.imageItem.file)} onLoad={e => setImageDimensions(`${(e.target as HTMLImageElement).naturalWidth}x${(e.target as HTMLImageElement).naturalHeight}px`)}/>
			<div className={styles.textsContainer}>
				<p className={`${styles.title} fontMedium`}>{props.phaseIndex == 3 ? `${props.imageItem.name}.${props.imageItem.outputFormat}` : props.imageItem.file.name}</p>
				<p className={`${styles.info} font12`}>{imageDimensions} • {Math.floor(fileSize * 100) / 100} {fileSizeUnits[fileSizeUnitIndex]}</p>
			</div>

			<div className={styles.buttonsContainer}>
				{
					props.phaseIndex <= 1 ? (
						<>
							{
								IsFormatLossy(props.imageItem.outputFormat) ? (
									<>
										<Button
											type={ButtonType.Secondary}
											svg={<SVG name='settings'/>}
											square
											onClick={onOpenSettings}/>
									</>) : <></>
							}

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

							<Button
								type={ButtonType.SecondaryDestructive}
								svg={<SVG name='delete'/>}
								square
								onClick={onRemove}/>
						</>
					) : props.phaseIndex == 3 ? (
						<Button
							type={ButtonType.Secondary}
							svg={<SVG name='download'/>}
							square
							onClick={onDownload}/>
					) : <></>
				}
			</div>
		</div>
	);
}