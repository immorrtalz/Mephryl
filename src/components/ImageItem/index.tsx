import styles from './ImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { SVG } from '../SVGLibrary';
import { Dropdown } from '../Dropdown';
import { ImageItemInfo } from '../../scripts/ImageItemInfo';
import { supportedImageFormats, GetAvailableOutputFormats } from '../../scripts/FormatsTools';

interface Props
{
	imageItem: ImageItemInfo;
	phaseIndex: number;
	onOpenSettings?: (...args : any[]) => any;
	onChangeOutputFormat?: (...args : any[]) => any;
	onChangeOutputQuality?: (...args : any[]) => any;
	onDownload?: (...args: any[]) => any;
	onRemove?: (...args: any[]) => any;
}

export default function UploadedImageItem(props: Props)
{
	const onOpenSettings = () => props.onOpenSettings?.();
	const onChangeOutputFormat = (outputFormat: string) => props.onChangeOutputFormat?.(supportedImageFormats.find(format => format.name === outputFormat));
	const onDownload = () => props.onDownload?.();
	const onRemove = () => props.imageItem.file ? props.onRemove?.(props.imageItem.file) : undefined;

	const fileSizeUnits = ['Bytes', 'KB', 'MB'];
	var fileSize = props.phaseIndex == 3 && props.imageItem.blob ? props.imageItem.blob.size : props.imageItem.file.size;
	for (var fileSizeUnitIndex = 0; fileSizeUnitIndex < fileSizeUnits.length && fileSize >= 1024; fileSizeUnitIndex++) fileSize /= 1024;

	const supportedConvertFormats = GetAvailableOutputFormats(props.imageItem);

	return (
		<div className={styles.uploadedImageItem}>
			<div className={styles.textsContainer}>
				<p className={`${styles.title} fontMedium`}>{props.imageItem.name}{props.phaseIndex == 3 ? props.imageItem.outputFormat.extension : props.imageItem.inputFormat.extension}</p>
				<p className={`${styles.info} font12`}>{Math.floor(fileSize * 100) / 100} {fileSizeUnits[fileSizeUnitIndex]}</p>
			</div>

			<div className={styles.buttonsContainer}>
				{
					props.phaseIndex <= 1 ? (
						<>
							{
								<Button
									type={ButtonType.Secondary}
									svg={<SVG name='settings'/>}
									square
									disabled={!props.imageItem.outputFormat.isLossy}
									onClick={onOpenSettings}/>
							}

							{
								supportedConvertFormats.length !== 0 ? (
									<Dropdown
										options=
										{
											supportedConvertFormats.map(format => (
											{
												title: format.toUpperCase(),
												value: format
											}))
										}
										onOptionClick={(format: string) => {onChangeOutputFormat(format)}}/>) : <></>
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