import { ReactElement } from 'react';
import styles from './UploadedImageItem.module.scss';
import { Button, ButtonType } from '../Button';
import { DeleteSVG, SettingsSVG } from '../SVGLibrary';

/* class Props
{
	title? : string = '';
	svg? : ReactElement = <></>;
	isSquare? : string = 'false';
	onClick? : () => any;
} */

export default function UploadedImageItem(/* props: Props */)
{
	/* const onClick = () =>
	{
		//alert('General button alert');
		if (props.onClick !== undefined) props.onClick();
	}; */
		
	/* <button className={`${styles.button} fontMedium colorWhite90 bgBlur ${props.isSquare == 'true' ? styles.squareButton : ''}`} onClick={onClick}>
		{props.svg}
		{props.title}
	</button> */

	return (
		<div className={styles.uploadedImageItem}>
			<img/>
			<div className={styles.textsContainer}>
				<p className={styles.title}>DSC_01012025-0000_image.png</p>
				<p className={`${styles.info} font12`}>1920x1080 • 1.2 MB</p>
			</div>

			<Button
				type={ButtonType.Secondary}
				square
				svg={<SettingsSVG/>}
				/* onClick={selectImageFiles} *//>

			<Button
				type={ButtonType.SecondaryDestructive}
				square
				svg={<DeleteSVG/>}
				/* onClick={selectImageFiles} *//>
		</div>
	);
}