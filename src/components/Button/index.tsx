import { ReactElement } from 'react';
import styles from './Button.module.scss';

export enum ButtonType
{
	Primary,
	Secondary,
	SecondaryDestructive
}

interface Props
{
	type?: ButtonType;
	title?: string;
	svg?: ReactElement;
	square?: boolean;
	disabled?: boolean;
	onClick?: (...args: any[]) => any;
}

export function Button(props: Props)
{
	const onClick = () => props.onClick?.();
	var dynamicClassNames: string[] = [];

	switch (props.type)
	{
		case ButtonType.Secondary:
			dynamicClassNames.push(styles.secondaryButton);
			break;

		case ButtonType.SecondaryDestructive:
			dynamicClassNames.push(styles.secondaryButtonDestructive);
			break;

		default: dynamicClassNames.push(styles.primaryButton);
	}

	if (props.square) dynamicClassNames.push(styles.squareButton);

	return (
		<button className={`${styles.button} ${dynamicClassNames.join(' ')} fontMedium bgBlur`} onClick={onClick} disabled={props.disabled}>
			{props.svg}
			{props.title}
		</button>
	);
}