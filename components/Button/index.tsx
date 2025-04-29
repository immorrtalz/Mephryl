import { ReactElement } from 'react';
import styles from './Button.module.scss';

class Props
{
	title? : string = '';
	svg? : ReactElement = <></>;
	isSquare? : string = 'false';
	onClick? : () => any;
}

export default function Button(props: Props)
{
	const onClick = () =>
	{
		//alert('General button alert');
		if (props.onClick !== undefined) props.onClick();
	};

	return (
		<button className={`${styles.button} fontMedium colorWhite90 bgBlur ${props.isSquare == 'true' ? styles.squareButton : ''}`} onClick={onClick}>
			{props.svg}
			{props.title}
		</button>
	);
}