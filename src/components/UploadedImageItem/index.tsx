import { ReactElement, useEffect, useState } from 'react';
import styles from './UploadedImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { DeleteSVG, DownloadSVG, SettingsSVG } from '../SVGLibrary';
import { Magick } from '@imagemagick/magick-wasm';

class Props
{
	file? : File;
	uploadPhase? : boolean;
	onRemove? : (file : File) => any;
	onDownload? : () => any;
}

export default function UploadedImageItem(props: Props)
{
	function onRemove() { if (props.file && props.onRemove) props.onRemove(props.file); };
	function onDownload() { if (props.onDownload) props.onDownload(); };

	const [imageDimensions, setImageDimensions] = useState<string>('0x0px');

	const fileSizeUnits = ['Bytes', 'KB', 'MB'];
	var fileSize : number = props.file ? props.file.size : 0;
	var fileSizeType : string = fileSizeUnits[0];

	if (props.file)
	{
		fileSize = props.file.size;
		var fileSizeUnitIndex = 0;
		for (; fileSizeUnitIndex < fileSizeUnits.length && fileSize >= 1024; fileSizeUnitIndex++) fileSize /= 1024;
		fileSizeType = fileSizeUnits[fileSizeUnitIndex];
	}

	return (
		<div className={styles.uploadedImageItem}>
			<img src={props.file ? window.URL.createObjectURL(props.file) : ''} onLoad={e => setImageDimensions(`${(e.target as HTMLImageElement).naturalWidth}x${(e.target as HTMLImageElement).naturalHeight}px`)}/>
			<div className={styles.textsContainer}>
				<p className={`${styles.title} fontMedium`}>{props.file?.name}</p>
				<p className={`${styles.info} font12`}>{imageDimensions} • {Math.floor(fileSize * 100) / 100} {fileSizeType}</p>
			</div>

			{
				props.uploadPhase ? (
					<>
						<Button
							type={ButtonType.Secondary}
							svg={<SettingsSVG/>}
							square
							/* onClick={selectImageFiles} *//>

						<Button
							type={ButtonType.SecondaryDestructive}
							svg={<DeleteSVG/>}
							square
							onClick={onRemove}/>
					</>
				) : (
					<Button
						type={ButtonType.Secondary}
						svg={<DownloadSVG/>}
						square
						onClick={onDownload}/>
				)
			}
		</div>
	);
}